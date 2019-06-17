#!/usr/bin/env python
# -*- coding: utf-8 -*-

###############################################################################
#  Copyright 2017 Kitware Inc.
#
#  Licensed under the Apache License, Version 2.0 ( the "License" );
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
###############################################################################

import json
import os
import subprocess
import shutil

from configparser import SafeConfigParser
from jsonpath_rw import parse

import cumulus.taskflow.cluster
from cumulus.taskflow.cluster import create_girder_client
from cumulus.tasks.job import submit_job, monitor_job, monitor_jobs
from cumulus.tasks.job import download_job_input_folders
from cumulus.tasks.job import upload_job_output_to_folder, job_directory
from cumulus.transport import get_connection
from cumulus.transport.files.download import download_path_from_cluster

from hpccloud.taskflow.utility import *

class OpenFOAMTaskFlow(cumulus.taskflow.cluster.ClusterProvisioningTaskFlow):
    """
    // Payload from (Line ~74) workflows/openfoam/components/steps/Simulation/Start/index.js
    {
      input: {
        folder: {
          id: this.props.simulation.metadata.inputFolder._id,
        },
        shFile: {
          id: this.props.simulation.metadata.inputFolder.files.sh,
        },
      },
      output: {
        folder: {
          id: this.props.simulation.metadata.outputFolder._id,
        },
      },
    }
    """

    OPENFOAM_IMAGE = {
        'owner': '695977956746',
        'tags': {
            'openfoam': '1612'
        }
    }

    def start(self, *args, **kwargs):
        image_spec = self.OPENFOAM_IMAGE.copy()
        kwargs['image_spec'] = image_spec
        kwargs['next'] = create_openfoam_job.s()

        super(OpenFOAMTaskFlow, self).start(self, *args, **kwargs)

@cumulus.taskflow.task
def create_openfoam_job(task, *args, **kwargs):
    # Girder client
    client = create_girder_client(
        task.taskflow.girder_api_url, task.taskflow.girder_token)

    # Save the cluster in the taskflow for termination
    cluster = kwargs.pop('cluster')
    task.taskflow.set_metadata('cluster', cluster)

    # Create job definition
    task.taskflow.logger.info('Creating OpenFoam job.')
    body = {
        'name': 'openfoam_run',
        'commands': [
            'chmod +x $PWD/run.sh',
            'xhost +local:of_v1612_plus',
            'docker start of_v1612_plus',
            'docker exec -t of_v1612_plus $PWD/run.sh $PWD'
        ],
        'input': [
            {
              'folderId': kwargs['input']['folder']['id'],
              'path': '.'
            }
        ],
        'output': [
            { 'path': 'simulation/log.blockMesh' },
            { 'path': 'simulation/log.patchSummary' },
            { 'path': 'simulation/log.potentialFoam' },
            { 'path': 'simulation/log.reconstructParMesh' },
            { 'path': 'simulation/log.surfaceFeatureExtract' },
            { 'path': 'simulation/log.snappyHexMesh' },
            { 'path': 'simulation/log.simpleFoam' }
        ]
    }

    # Register job in girder + attach to taskflow
    job = client.post('jobs', data=json.dumps(body))
    task.logger.info('OpenFOAM job created: %s' % job['_id'])
    task.taskflow.logger.info('OpenFOAM job created.')
    task.taskflow.set_metadata('jobs', [job])

    # Capture job working directory
    target_dir = job_directory(cluster, job)
    task.taskflow.set_metadata('dataDir', target_dir)

    # Move to the next task
    submit_open_foam_job.delay(cluster, job,  *args, **kwargs)


@cumulus.taskflow.task
def submit_open_foam_job(task, cluster, job, *args, **kwargs):
    # Now download job inputs
    task.logger.info('Uploading input files to cluster.')
    download_job_input_folders(cluster, job,
        log_write_url=None,
        girder_token=task.taskflow.girder_token,
        submit=False)
    task.logger.info('Uploading complete.')

    # Setup job parameters
    task.taskflow.logger.info('Submitting job to cluster.')
    job['params'] = {}

    ## parallel_environment
    parallel_environment = parse('config.parallelEnvironment').find(cluster)
    if parallel_environment:
        parallel_environment = parallel_environment[0].value
        job['params']['parallelEnvironment'] = parallel_environment

    ## slots
    job['params']['numberOfSlots'] = 1

    ## output dir
    job_output_dir = get_cluster_job_output_dir(cluster)
    if job_output_dir:
        job['params']['jobOutputDir'] = job_output_dir


    # Submit job to the queue
    submit_job(cluster, job,
        log_write_url=None,
        girder_token=task.taskflow.girder_token,
        monitor=False)

    # Move to the next task
    monitor_open_foam_job.delay(cluster, job, *args, **kwargs)


@cumulus.taskflow.task
def monitor_open_foam_job(task, cluster, job, *args, **kwargs):
    task.logger.info('Monitoring job on cluster.')

    # Move to next task when monitor job is done
    task.taskflow \
        .on_complete(monitor_job) \
        .run(upload_output.s(cluster, job, *args, **kwargs))

    # Monitor job in a loop manner
    task.taskflow.run_task(
        monitor_job.s(cluster, job, girder_token=task.taskflow.girder_token))

@cumulus.taskflow.task
def upload_output(task, cluster, job, *args, **kwargs):
    # Girder client
    client = create_girder_client(
        task.taskflow.girder_api_url, task.taskflow.girder_token)

    # Refresh state of job
    job = client.get('jobs/%s' % job['_id'])

    # Register generated file into girder
    task.taskflow.logger.info('Uploading results from cluster')
    output_folder_id = parse('output.folder.id').find(kwargs)
    if output_folder_id:
        task.taskflow.logger.info('Exporting to folder %s' % output_folder_id)
        output_folder_id = output_folder_id[0].value
        job['output'] = [{
            'folderId': output_folder_id,
            'path': '.'
        }]
    else:
        task.taskflow.logger.info('No output.folder.id')

    # Upload files metadata
    upload_job_output_to_folder(cluster, job,
        log_write_url=None,
        job_dir=None,
        girder_token=task.taskflow.girder_token)

    # Done...
    task.taskflow.logger.info('Upload complete.')
