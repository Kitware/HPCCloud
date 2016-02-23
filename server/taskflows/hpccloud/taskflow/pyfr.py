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

import cumulus.taskflow
from cumulus.starcluster.tasks.job import download_job_input_folders, submit_job
from cumulus.starcluster.tasks.job import monitor_job, upload_job_output_to_folder
from cumulus.starcluster.tasks.job import terminate_job

from girder.utility.model_importer import ModelImporter
from girder.api.rest import getCurrentUser
from girder.constants import AccessType
from girder_client import GirderClient, HttpError

class PyFrTaskFlow(cumulus.taskflow.TaskFlow):
    """
    {
        "input": {
            "folder": {
                "id": <the id of the folder containing input files>
            },
            "meshFile": {
                "id": <the file id of the mesh file>
            }
        },
        "output": {
            "folder": {
                "id": <id of folder to upload output into>
            }
        },
        "cluster": {
            "_id": <id of cluster to run on>
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

        super(PyFrTaskFlow, self).start(
            import_mesh.s(self,*args, **kwargs))

    def terminate(self):
        self.run_task(pyfr_terminate.s())

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



def _create_girder_client(girder_api_url, girder_token):
    client = GirderClient(apiUrl=girder_api_url)
    client.token = girder_token

    return client

def _import_mesh(logger, input_path, output_path, extn):
    #
    # HACK! In the future we should call pyfr directly, however, we need to
    # support python3 first!
    #
    command = [
        'pyfr', 'import', '-t', 'gmsh', input_path, output_path
    ]

    try:
        subprocess.check_output(command, stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as ex:
        logger.exception(ex.output)
        raise

def _partition_mesh(logger, input_path, output_dir,  n):
    command = [
        'pyfr', 'partition', str(n), input_path, output_dir
    ]

    try:
        subprocess.check_output(command, stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as ex:
        logger.exception(ex.output)
        raise

def _export_solution(logger, mesh_path, input_path, output_path):
    command = [
        'pyfr', 'export', mesh_path, input_path, output_path
    ]

    try:
        subprocess.check_output(command, stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as ex:
        logger.exception(ex.output)
        raise

@cumulus.taskflow.task
def pyfr_terminate(task):
    cluster = task.taskflow['cluster']
    for job in task.taskflow.get('meta', {}).get('jobs', []):
        terminate_job(
            cluster, job, log_write_url=None,
            girder_token=task.taskflow.girder_token)

@cumulus.taskflow.task
def import_mesh(task, *args, **kwargs):
    task.taskflow.logger.info('Importing mesh into PyFr format.')

    task.logger.info('Downloading input mesh.')
    client = _create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)

    input_folder_id = kwargs['input']['folder']['id']
    mesh_file_id = kwargs['input']['meshFile']['id']

    try:
        input_path = os.path.join(tempfile.tempdir, input_folder_id)
        output_dir =  tempfile.mkdtemp()
        output_path = os.path.join(output_dir, 'mesh.pyfrm')

        client.downloadFile(mesh_file_id, input_path)
        task.logger.info('Downloading complete.')

        # Now get the file metadata
        file = client.getResource('file', mesh_file_id)
        extn = file['exts'][0]
        task.logger.info('Converting mesh to pyfrm format.')
        _import_mesh(task.taskflow.logger, input_path, output_path, extn)
        task.logger.info('Conversion complete.')

        task.logger.info('Partitioning the mesh.')

        if 'numberOfSlots' in kwargs \
                and int(kwargs['numberOfSlots']) > 1:
            _partition_mesh(
                task.logger, output_path, output_dir, kwargs['numberOfSlots'])


        else:
            task.logger.info('Skipping partitioning we are running serial.')

        task.logger.info('Partitioning complete.')

        task.logger.info('Uploading converted mesh.')
        size = os.path.getsize(output_path)
        with open(output_path) as fp:
            girder_file = client.uploadFile(
                input_folder_id, fp, 'mesh.pyfrm', size=size,
                parentType='folder')
            kwargs['imported_mesh_file_id'] = girder_file['_id']

        task.logger.info('Upload complete.')

    finally:
        if os.path.exists(input_path):
            os.remove(input_path)
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)

    create_job.delay(*args, **kwargs)


@cumulus.taskflow.task
def create_job(task, *args, **kwargs):
    task.taskflow.logger.info('Create PyFr job.')
    input_folder_id = kwargs['input']['folder']['id']

    number_of_slots = kwargs.get('numberOfSlots', 1)

    body = {
        'name': 'pyfr',
        'commands': [
            "mpirun -n %s pyfr run -b openmp input/mesh.pyfrm input/pyfr.ini" % number_of_slots
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

    task.taskflow.set('jobs', [job])

    submit.delay(job, *args, **kwargs)

@cumulus.taskflow.task
def submit(task, job, *args, **kwargs):
    task.taskflow.logger.info('Submitting job to cluster.')
    girder_token = task.taskflow.girder_token
    cluster = kwargs.pop('cluster')
    task.taskflow.set('cluster', cluster)

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

NUMBER__OF_EXPORT_TASKS = 10

def _list_solution_files(client, folder_id):
    """
    List the PyFR solution files held in a Girder folder.

    :param client: The Girder client for Girder access.
    :param folder_id: The folder to list solution files in.
    """

    items = client.listItem(folder_id)
    for item in items:
        files = client.get('item/%s/files' % item['_id'], parameters={
            'limit': 1,
        })

        if len(files) == 0:
            continue

        file = files[0]
        exts = file['exts']
        if len(exts) == 2 and exts[1] == 'pyfrs':
            yield file

@cumulus.taskflow.task
def upload_output(task, cluster, job, *args, **kwargs):
    task.taskflow.logger.info('Uploading results from cluster')
    output_folder_id = kwargs['output']['folder']['id']

    job['output'] = [{
        'folderId': output_folder_id,
        'path': '.'
    }]

    upload_job_output_to_folder(cluster, job, log_write_url=None, job_dir=None,
                                girder_token=task.taskflow.girder_token)

    task.taskflow.logger.info('Upload complete.')

    # Now we need to export to VTK format
    imported_mesh_file_id = kwargs.pop('imported_mesh_file_id')

    client = _create_girder_client(
        task.taskflow.girder_api_url, task.taskflow.girder_token)
    solution_files = list(_list_solution_files(client, output_folder_id))
    number_files = len(solution_files)

    # The number 100 is pretty arbitrary!
    if number_files < 100:
        export_output.delay(
            output_folder_id, imported_mesh_file_id, solution_files)
    # Break into chunks a run in parallel
    else:
        for chunk in [solution_files[i::NUMBER__OF_EXPORT_TASKS] for i in xrange(NUMBER__OF_EXPORT_TASKS)]:
            export_output.delay(output_folder_id, imported_mesh_file_id, chunk)


def _export_file(task, client, output_folder_id, mesh_path, file, output_dir):
    """
    Export a single solution file held in Girder into VTK format

    :param task: The current task we are running in.
    :param client: The Girder client for access to Girder.
    :param output_folder_id: The target folder to upload the VTK file to.
    :param meth_path: The path to the mesh file.
    :param file: The Girder file object for the solution file.
    :param output_dir: The temporay working directory to write files into.
    """
    name = file['name']
    solution_file_path = os.path.join(output_dir, name)
    client.downloadFile(file['_id'], solution_file_path)
    vtk_filename = '%s.vtu' % name.rsplit('.', 1)[0]
    vtk_file_path = os.path.join(output_dir, vtk_filename)
    _export_solution(task.logger, mesh_path, solution_file_path, vtk_file_path)
    with open(vtk_file_path, 'r') as fp:
        size = os.path.getsize(vtk_file_path)
        client.uploadFile(
            output_folder_id, fp, vtk_filename, size=size,
            parentType='folder')


@cumulus.taskflow.task
def export_output(task, folder_id, imported_mesh_file_id, files):
    """
    Export a batch of PyFR solution files into VTK format.

    :param: folder_id: The target folder id to upload the VTK files to.
    :param: imported_mesh_file_id: The mesh in PyFR format
    :param: files: The files to export ( Girder JSON objects )
    """
    client = _create_girder_client(
        task.taskflow.girder_api_url, task.taskflow.girder_token)

    output_dir =  tempfile.mkdtemp()

    try:
        mesh_path = os.path.join(output_dir, 'mesh.pyfrm')

        task.logger.info('Downloading mesh.')
        client.downloadFile(imported_mesh_file_id, mesh_path)
        task.logger.info('Downloading complete.')

        for file in files:
            _export_file(task, client, folder_id, mesh_path, file, output_dir)

    finally:
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
