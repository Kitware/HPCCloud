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
import shutil
from ConfigParser import SafeConfigParser
from jsonpath_rw import parse
from bson.objectid import ObjectId

import cumulus.taskflow
from cumulus.tasks.job import download_job_input_folders, submit_job
from cumulus.tasks.job import monitor_job, monitor_jobs
from cumulus.tasks.job import upload_job_output_to_folder
from cumulus.tasks.job import terminate_job
from cumulus.transport.files.download import download_path_from_cluster
from girder.utility.model_importer import ModelImporter
from girder.api.rest import getCurrentUser
from girder.constants import AccessType
from girder_client import GirderClient, HttpError

from hpccloud.taskflow.utility import *

class NwChemTaskFlow(cumulus.taskflow.TaskFlow):
    """
    {
        "input": {
            "folder": {
                "id": <the id of the folder containing input files>
            },
            "geometry": {
                "id": <the file id of the geometry file>
            }
            "nwFile":
            {
                "id": <the file id of the input file>
            }
        },
        "output": {
            "folder": {
                "id": <id of folder to upload output into>
            }
        },
        "cluster": {
            "_id": <id of cluster to run on>
        },
        "numberOfSlots": <number of processors to run on>
    }
    """
    NWCHEM_IMAGE = {
        'name': 'NWChem_ParaView-5.0.1',
        'owner': '695977956746'
    }

    def start(self, *args, **kwargs):
        user = getCurrentUser()
        # Load the cluster
        # TODO: should this be in a common class?
        cluster_id = parse('cluster._id').find(kwargs)
        if cluster_id:
            cluster_id = cluster_id[0].value
            model = ModelImporter.model('cluster', 'cumulus')
            cluster = model.load(cluster_id, user=user, level=AccessType.ADMIN)
            cluster = model.filter(cluster, user, passphrase=False)
            kwargs['cluster'] = cluster

        profile_id = parse('cluster.profileId').find(kwargs)
        if profile_id:
            profile_id = profile_id[0].value
            model = ModelImporter.model('aws', 'cumulus')
            profile = model.load(profile_id, user=user, level=AccessType.ADMIN)
            kwargs['profile'] = profile

        kwargs['image_spec'] = self.NWCHEM_IMAGE
        kwargs['next'] = setup_input.s()

        super(NwChemTaskFlow, self).start(
            setup_cluster.s(
                self, *args, **kwargs))

    def terminate(self):
        self.run_task(nwchem_terminate.s())

    def delete(self):
        for job in self.get('meta', {}).get('jobs', []):
            job_id = job['_id']
            client = _create_girder_client(
            self.girder_api_url, self.girder_token)
            client.delete('jobs/%s' % job_id)

            try:
                client.get('jobs/%s' % job_id)
            except HttpError as e:
                if e.status != 404:
                    self.logger.error('Unable to delete job: %s' % job_id)


# TODO: move to common class
def _create_girder_client(girder_api_url, girder_token):
    client = GirderClient(apiUrl=girder_api_url)
    client.token = girder_token

    return client

@cumulus.taskflow.task
def nwchem_terminate(task):
    cluster = task.taskflow['meta']['cluster']
    client = _create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)
    terminate_jobs(
        task, client, cluster, task.taskflow.get('meta', {}).get('jobs', []))

def update_config_file(task, client, *args, **kwargs):

    ini_file_id = kwargs['input']['nwFile']['id']

    _, path = tempfile.mkstemp()
    fileContents = ''

    task.logger.info('Downloading configuration file.')
    try:
        with open(path, 'w') as fp:
            client.downloadFile(ini_file_id, path)

        with open(path, 'r') as fp:
            for line in fp.readlines():
                if 'load' in line:
                    task.logger.info('Expanding path to geometry files.')
                    # Find the geometry file and check for input in file path
                    for w in line.split():
                        (filePath, fileExt) = os.path.splitext(w)
                        if fileExt == '.xyz' or fileExt == '.pdb':
                            (fileDir, fileName) = os.path.split(w)
                            if (not fileDir.startswith('input')):
                                newPath = 'input' + os.sep + filePath
                                line = line.replace(filePath, newPath, 1)
                fileContents += line

        with open(path, 'w') as fp:
            fp.write(fileContents)

        task.logger.info('Uploading updated configuration file.')

        with open(path, 'r') as fp:
            client.uploadFileContents(ini_file_id, fp, os.path.getsize(path))

    finally:
        os.remove(path)

@cumulus.taskflow.task
def setup_input(task, *args, **kwargs):
    input_folder_id = kwargs['input']['folder']['id']
    geometry_file_id = kwargs['input']['geometryFile']['id']
    kwargs['geometryFileId'] = geometry_file_id

    number_of_procs = kwargs.get('numberOfSlots')
    if not number_of_procs:
        number_of_procs = kwargs.get('numberOfNodes')

    if not number_of_procs:
        size = parse('cluster.config.launch.params.node_instance_count').find(kwargs)
        if size:
            number_of_procs = size[0].value + 1
        else:
            raise Exception('Unable to extract number of nodes in cluster')


    if not number_of_procs:
        raise Exception('Unable to determine number of mpi processes to run.')

    number_of_procs = int(number_of_procs)
    kwargs['numberOfProcs']  = number_of_procs

    client = _create_girder_client(
        task.taskflow.girder_api_url, task.taskflow.girder_token)

    # Get the geometry file metadata to see if we need to import
    geometry_file = client.getResource('file/%s' % geometry_file_id)
    kwargs['geometryFilename'] = geometry_file['name']

    update_config_file(task, client, *args, **kwargs)

    ini_file_id = kwargs['input']['nwFile']['id']
    ini_file = client.getResource('file/%s' % ini_file_id)
    kwargs['nwFilename'] = ini_file['name']

    create_job.delay(*args, **kwargs)


@cumulus.taskflow.task
def create_job(task, *args, **kwargs):
    task.logger.info('Taskflow %s' % task.taskflow.id)
    task.taskflow.logger.info('Create NWChem job.')
    input_folder_id = kwargs['input']['folder']['id']

    # TODO: setup command to run with mpi
    body = {
        'name': 'nwchem_run',
        'commands': [
            "nwchem input/%s" % (kwargs['nwFilename'])
        ],
        'input': [
            {
              'folderId': input_folder_id,
              'path': 'input'
            }
        ],
        'output': [],
        'params': {
            'numberOfSlots': kwargs['numberOfProcs']
        }
    }

    client = _create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)

    job = client.post('jobs', data=json.dumps(body))

    task.taskflow.set_metadata('jobs', [job])

    submit.delay(job, *args, **kwargs)

@cumulus.taskflow.task
def submit(task, job, *args, **kwargs):
    task.taskflow.logger.info('Submitting job to cluster.')
    girder_token = task.taskflow.girder_token
    cluster = kwargs.pop('cluster')
    task.taskflow.set_metadata('cluster', cluster)

    # Now download and submit job to the cluster
    task.logger.info('Uploading input files to cluster.')
    download_job_input_folders(cluster, job, log_write_url=None,
                        girder_token=girder_token, submit=False)
    task.logger.info('Uploading complete.')

    submit_nwchem_job.delay(cluster, job, *args, **kwargs)

@cumulus.taskflow.task
def submit_nwchem_job(task, cluster,  job, *args, **kwargs):
    task.logger.info('Submitting job %s to cluster.' % job['_id'])
    girder_token = task.taskflow.girder_token

    job['params'].update(kwargs)

    submit_job(cluster, job, log_write_url=None,
                          girder_token=girder_token, monitor=False)

    monitor_nwchem_job.delay(cluster, job, *args, **kwargs)

@cumulus.taskflow.task
def monitor_nwchem_job(task, cluster, job, *args, **kwargs):
    task.logger.info('Monitoring job on cluster.')
    girder_token = task.taskflow.girder_token

    monitor_job.apply_async((cluster, job), {'girder_token': girder_token,
                                             'monitor_interval': 30},
                            link=upload_output.s(cluster, job, *args, **kwargs))

@cumulus.taskflow.task
def upload_output(task, _, cluster, job, *args, **kwargs):
    task.taskflow.logger.info('Uploading results from cluster')
    output_folder_id = kwargs['output']['folder']['id']

    client = _create_girder_client(
        task.taskflow.girder_api_url, task.taskflow.girder_token)

    # Refresh state of job
    job = client.get('jobs/%s' % job['_id'])
    job['output'] = [{
        'folderId': output_folder_id,
        'path': '.'
    }]

    upload_job_output_to_folder(cluster, job, log_write_url=None, job_dir=None,
                                girder_token=task.taskflow.girder_token)

    task.taskflow.logger.info('Upload job output complete.')

