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
import cumulus.taskflow
from cumulus.starcluster.tasks.job import download_job_input_folders, submit_job
from cumulus.starcluster.tasks.job import monitor_job, upload_job_output_to_folder

from girder.utility.model_importer import ModelImporter
from girder.api.rest import getCurrentUser
from girder.constants import AccessType
from girder_client import GirderClient

class PyFrTaskFlow(cumulus.taskflow.TaskFlow):
    """
    This is a simple linear taskflow, chain together 6 task. Notice that
    simple_task3 "fans" out the flow, by scheduling 10 copies of simple_task4.
    """
    def start(self, *args, **kwargs):

        # Load the cluster
        model = ModelImporter.model('cluster', 'cumulus')
        user = getCurrentUser()
        cluster = model.load(kwargs['cluster']['_id'],
                             user=user, level=AccessType.ADMIN)
        cluster = model.filter(cluster, user, passphrase=False)
        print cluster
        kwargs['cluster'] = cluster

        super(PyFrTaskFlow, self).start(
            import_mesh.s(self,*args, **kwargs))

    def terminate(self):
        pass

    def delete(self):
        pass

def _create_girder_client(girder_api_url, girder_token):
    client = GirderClient(apiUrl=girder_api_url)
    client.token = girder_token

    return client

def _import_mesh(input_path, output_path, extn):
    #
    # HACK! In the future we should call pyfr directly, however, we need to
    # support python3 first!
    #
    command = [
        'pyfr', 'import', '-t', 'gmsh', input_path, output_path
    ]

    subprocess.check_call(command)


@cumulus.taskflow.task
def import_mesh(task, *args, **kwargs):
    task.taskflow.logger.info('Importing mesh into PyFr format.')

    task.logger.info('Downloading input mesh.')
    client = _create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)

    input_folder_id = kwargs['input']['folderId']
    mesh_file_id = kwargs['input']['meshFileId']

    try:
        input_path = os.path.join(tempfile.tempdir, input_folder_id)
        output_path = os.path.join(tempfile.tempdir, '%s.%s' % (mesh_file_id, 'pyfrm'))

        client.downloadFile(mesh_file_id, input_path)
        task.logger.info('Downloading complete.')

        # Now get the file metadata
        file = client.getResource('file', mesh_file_id)
        extn = file['exts'][0]
        task.logger.info('Converting mesh to pyfrm format.')
        _import_mesh(input_path, output_path, extn)
        task.logger.info('Conversion complete.')

        task.logger.info('Uploading converted mesh.')
        size = os.path.getsize(output_path)
        with open(output_path) as fp:
            client.uploadFile(input_folder_id, fp, 'mesh.pyfrm', size=size, parentType='folder')

        task.logger.info('Upload complete.')

    finally:
        if os.path.exists(input_path):
            os.remove(input_path)
        if os.path.exists(output_path):
            os.remove(output_path)

    create_job.delay(*args, **kwargs)


@cumulus.taskflow.task
def create_job(task, *args, **kwargs):
    task.taskflow.logger.info('Create PyFr job.')
    input_folder_id = kwargs['input']['folderId']

    body = {
        'name': 'pyfr',
        'commands': [
            "mpirun -n {{ '-n %d' % numberOfSlots if numberOfSlots else 1 }} pyfr run -b openmp input/mesh.pyfrm input/pyfr.ini"
        ],
        'input': [
            {
              'folderId': input_folder_id,
              'path': 'input'
            }
        ],
        'output': []
    }

    client = _create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)

    job = client.post('jobs', data=json.dumps(body))

    submit.delay(job, *args, **kwargs)

@cumulus.taskflow.task
def submit(task, job, *args, **kwargs):
    task.taskflow.logger.info('Submitting job to cluster.')
    girder_token = task.taskflow.girder_token
    girder_api_url = task.taskflow.girder_api_url
    cluster = kwargs.pop('cluster')

    client = _create_girder_client(girder_api_url, girder_token)

    # Now download and submit job to the cluster

    task.logger.info('Uploading input files to cluster.')
    download_job_input_folders(cluster, job, log_write_url=None,
                        girder_token=girder_token, submit=False)
    task.logger.info('Uploading complete.')

    submit_pyfr_job.delay(cluster, job, *args, **kwargs)

@cumulus.taskflow.task
def submit_pyfr_job(task, cluster,  job, *args, **kwargs):
    task.logger.info('Submitting job to cluster.')
    girder_token = task.taskflow.girder_token

    submit_job(cluster, job, log_write_url=None,
                          girder_token=girder_token, monitor=False)

    monitor_pyfr_job.delay(cluster, job, *args, **kwargs)

@cumulus.taskflow.task
def monitor_pyfr_job(task, cluster, job, *args, **kwargs):
    task.logger.info('Monitoring job on cluster.')
    girder_token = task.taskflow.girder_token

    task.taskflow.on_complete(monitor_job) \
        .run(upload_output.s(cluster, job, *args, **kwargs))

    task.taskflow.run_task(
        monitor_job.s(cluster, job, girder_token=girder_token))


@cumulus.taskflow.task
def upload_output(task, cluster, job, *args, **kwargs):
    task.taskflow.logger.info('Uploading results from cluster')
    output_folder_id = kwargs['output']['folderId']

    print cluster

    job['output'] = [{
        'folderId': output_folder_id,
        'path': '.'
    }]

    upload_job_output_to_folder(cluster, job, log_write_url=None, job_dir=None,
                                girder_token=task.taskflow.girder_token)

    task.taskflow.logger.info('Upload complete.')


