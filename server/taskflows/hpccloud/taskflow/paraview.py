#!/usr/bin/env python
# -*- coding: utf-8 -*-

###############################################################################
#  Copyright 2016 Kitware Inc.
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
import tempfile
import json
import os
import subprocess
import sys
from jsonpath_rw import parse

import cumulus.taskflow
from cumulus.starcluster.tasks.job import download_job_input_folders, submit_job
from cumulus.starcluster.tasks.job import monitor_job, upload_job_output_to_folder
from cumulus.starcluster.tasks.job import terminate_job

from girder.utility.model_importer import ModelImporter
from girder.api.rest import getCurrentUser
from girder.constants import AccessType
from girder_client import GirderClient, HttpError

class ParaViewTaskFlow(cumulus.taskflow.TaskFlow):
    """
    {
        "dataDir": <passed to --data-dir,
        "cluster": {
            "_id": <this id of the cluster to run on>
        },
        "sessionKey": <a unqiue key to use to store the connection information>,
        "output": {
          "folder": {"id": <the id of a folder to upload any output> }
        }
    }

    """
    def start(self, *args, **kwargs):

        # Load the cluster
        model = ModelImporter.model('cluster', 'cumulus')
        user = getCurrentUser()
        cluster = model.load(kwargs['cluster']['_id'],
                             user=user, level=AccessType.ADMIN)
        cluster = model.filter(cluster, user, passphrase=False)
        kwargs['cluster'] = cluster

        print cluster


        super(ParaViewTaskFlow, self).start(
            create_paraview_job.s(self, *args, **kwargs))

    def terminate(self):
        self.run_task(paraview_terminate.s())
        self.run_task(cleanup_proxy_entries.s())

    def delete(self):
        for job in self.get('jobs'):
            job_id = job['_id']
            client = _create_girder_client(
            self.girder_api_url, self.girder_token)
            client.delete('jobs/%s' % job_id)

            try:
                client.get('jobs/%s' % job_id)
            except HttpError as e:
                if e.status != 404:
                    self.logger.error('Unable to delete job: %s' % job_id)

        cleanup_proxy_entries.delay()

def _create_girder_client(girder_api_url, girder_token):
    client = GirderClient(apiUrl=girder_api_url)
    client.token = girder_token

    return client

def validate_args(kwargs):
    required = ['dataDir', 'cluster.config.paraview.installDir', 'sessionKey']

    for r in required:
        if not parse(r).find(kwargs):
            raise Exception('Required parameter %s not provide to taskflow.')

@cumulus.taskflow.task
def paraview_terminate(task):
    cluster = task.taskflow['cluster']
    for job in task.taskflow.get('jobs'):
        terminate_job(
            cluster, job, log_write_url=None,
            girder_token=task.taskflow.girder_token)

@cumulus.taskflow.task
def create_paraview_job(task, *args, **kwargs):
    task.logger.info('Validating args passed to flow.')
    validate_args(kwargs)

    task.taskflow.logger.info('Creating ParaView job.')
    task.logger.info('Load ParaView submission script.')

    base_path = os.path.dirname(__file__)
    script_path = os.path.join(base_path, 'pvw.sh')

    if not os.path.exists(script_path):
        msg = 'Script path %s does not exists.' % script_path
        task.logger.info(msg)
        raise Exception(msg)

    with open(script_path, 'r') as fp:
        commands = fp.readlines()

    body = {
        'name': 'paraview',
        'commands': commands,
        'input': [],
        'output': []
    }

    client = _create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)

    job = client.post('jobs', data=json.dumps(body))
    task.logger.info('ParaView job create: %s' % job['_id'])
    task.taskflow.logger.info('ParaView job created.')

    task.taskflow.set('jobs', [job])

    submit_paraview_job.delay(job, *args, **kwargs)


@cumulus.taskflow.task
def submit_paraview_job(task, job, *args, **kwargs):
    task.taskflow.logger.info('Submitting job to cluster.')
    girder_token = task.taskflow.girder_token

    cluster = kwargs.pop('cluster')
    task.taskflow.set('cluster', cluster)

    print "cluster: "  + str(cluster)

    params = {}

    if 'dataDir' in kwargs:
        params['dataDir'] = kwargs['dataDir']

    if 'simulationJobId' in kwargs:
        params['simulationJobId'] = kwargs['simulationJobId']

    parallel_environment \
        = parse('config.parallelEnvironment').find(cluster)

    if parallel_environment:
        parallel_environment = parallel_environment[0].value
        params['parallelEnvironment'] = parallel_environment

    job_output_dir \
        = parse('config.jobOutputDir').find(cluster)
    if job_output_dir:
        job_output_dir = job_output_dir[0].value
        params['jobOutputDir'] = job_output_dir

    paraview_install_dir \
        = parse('config.paraview.installDir').find(cluster)
    if paraview_install_dir:
        paraview_install_dir = paraview_install_dir[0].value
        params['paraviewInstallDir'] = paraview_install_dir

    job['params'] = params

    submit_job(cluster, job, log_write_url=None,
                          girder_token=girder_token, monitor=False)

    monitor_paraview_job.delay(cluster, job, *args, **kwargs)

@cumulus.taskflow.task
def monitor_paraview_job(task, cluster, job, *args, **kwargs):
    task.logger.info('Monitoring job on cluster.')
    girder_token = task.taskflow.girder_token

    task.taskflow.on_complete(monitor_job) \
        .run(upload_output.s(cluster, job, *args, **kwargs))

    task.taskflow.run_task(
        monitor_job.s(cluster, job, girder_token=girder_token))

@cumulus.taskflow.task
def upload_output(task, cluster, job, *args, **kwargs):
    task.taskflow.logger.info('Uploading results from cluster')

    output_folder_id = parse('output.folder.id').find(kwargs)
    if output_folder_id:
        output_folder_id = output_folder_id[0].value

        job['output'] = [{
            'folderId': output_folder_id,
            'path': '.'
        }]

        upload_job_output_to_folder(cluster, job, log_write_url=None, job_dir=None,
                                    girder_token=task.taskflow.girder_token)
    else:
        task.logger.info('No output folder provided skipping upload.')

    task.taskflow.logger.info('Upload complete.')

@cumulus.taskflow.task
def cleanup_proxy_entries(task):
    client = _create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)

    cluster = task.taskflow['cluster']
    for job in task.taskflow['jobs']:
        client.delete('proxy/%s%2F%s' % (cluster['_id'], job['_id']))

