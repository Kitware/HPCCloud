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

import cumulus.taskflow
from cumulus.starcluster.tasks.job import download_job_input_folders, submit_job
from cumulus.starcluster.tasks.job import monitor_job, monitor_jobs
from cumulus.starcluster.tasks.job import upload_job_output_to_folder
from cumulus.starcluster.tasks.job import terminate_job

from girder.utility.model_importer import ModelImporter
from girder.api.rest import getCurrentUser
from girder.constants import AccessType
from girder_client import GirderClient, HttpError

from hpccloud.taskflow.utility import *

MESH_FILENAME = 'mesh.pyfrm'
INI_FILENAME = 'pyfr.ini'
CONFIG_ITEM_NAME = 'ini'
BACKEND_SECTIONS = [
    'backend-cuda',
    'backend-opencl',
    'backend-openmp'
]
PYFR_MESH_EXT = 'pyfrm'

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
            setup_input.s(self,*args, **kwargs))

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
    cluster = task.taskflow['meta']['cluster']
    client = _create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)
    terminate_jobs(
        task, client, cluster, task.taskflow.get('meta', {}).get('jobs', []))

def update_config_file(task, client, *args, **kwargs):

    input_folder_id = kwargs['input']['folder']['id']
    ini_file_id = kwargs['input']['iniFile']['id']

    if not ini_file_id:
      ini_item = client.listItem(input_folder_id, name=CONFIG_ITEM_NAME)

      if len(ini_item) != 1:
          raise Exception('Unable to fetch ini item.')

      ini_item = ini_item[0]

      # Now fetch the file
      files = client.get('item/%s/files' % ini_item['_id'],
          parameters={
              'limit': 1,
          })

      if len(files) != 1:
          raise Exception('Uable to fetch files for item.')

      ini_file = files[0]
      if ini_file['name'] != INI_FILENAME:
          raise Exception('Unexpected ini file name %s.' % ini_file['name'])

      ini_file_id = ini_file['_id']

    _, path = tempfile.mkstemp()

    task.logger.info('Downloading configuration file.')
    try:
        with open(path, 'w') as fp:
            client.downloadFile(ini_file_id, path)

        task.logger.info('Removing an backend configuration from file')
        config_parser = SafeConfigParser()
        config_parser.optionxform = str
        config_parser.read(path)

        for section in BACKEND_SECTIONS:
            if config_parser.remove_section(section):
                task.logger.info('%s removed.' % section)

        backend_section = 'backend-%s' % kwargs['backend']['type']
        task.logger.info('Adding backend configuration for %s')
        options = kwargs['backend'].copy()
        options.pop('type', None)
        options.pop('name', None)

        config_parser.add_section(backend_section)
        for  key, value in options.iteritems():
            config_parser.set(backend_section, key, value)

        with open(path, 'w') as fp:
            config_parser.write(fp)

        task.logger.info('Uploading updated configuration file.')

        with open(path, 'r') as fp:
            client.uploadFileContents(
                ini_file_id, fp, os.path.getsize(path))

    finally:
        os.remove(path)

@cumulus.taskflow.task
def setup_input(task, *args, **kwargs):
    task.logger.info('Input parameters: %s' % kwargs)

    input_folder_id = kwargs['input']['folder']['id']
    mesh_file_id = kwargs['input']['meshFile']['id']
    kwargs['meshFileId'] = mesh_file_id

    number_of_procs = kwargs.get('numberOfSlots')
    if not number_of_procs:
        number_of_procs = kwargs.get('numberOfNodes')

    if not number_of_procs:
        raise Exception('Unable to determine number of mpi processes to run.')

    number_of_procs = int(number_of_procs)
    kwargs['numberOfProcs']  = number_of_procs

    client = _create_girder_client(
        task.taskflow.girder_api_url, task.taskflow.girder_token)

    # Get the mesh file metadata to see if we need to import
    file = client.getResource('file/%s' % mesh_file_id)

    import_mesh = True
    if PYFR_MESH_EXT in file['exts']:
        task.logger.info('Mesh is already in pyfrm format.')
        import_mesh = False

    if import_mesh or number_of_procs > 1:
        task.logger.info('Downloading input mesh.')

        try:
            input_path = os.path.join(tempfile.tempdir, input_folder_id)
            output_dir =  tempfile.mkdtemp()
            output_path = os.path.join(output_dir, MESH_FILENAME)

            client.downloadFile(mesh_file_id, input_path)
            task.logger.info('Downloading complete.')


            if import_mesh:
                task.taskflow.logger.info('Importing mesh into PyFr format.')

                extn = file['exts'][0]
                task.logger.info('Converting mesh to pyfrm format.')
                _import_mesh(task.taskflow.logger, input_path, output_path, extn)
                task.logger.info('Conversion complete.')

            task.logger.info('Partitioning the mesh.')

            if number_of_procs > 1:
                _partition_mesh(
                    task.logger, output_path, output_dir, number_of_procs)
            else:
                task.logger.info('Skipping partitioning we are running on a single node.')

            task.logger.info('Partitioning complete.')

            task.logger.info('Uploading converted mesh.')
            size = os.path.getsize(output_path)
            with open(output_path) as fp:
                girder_file = client.uploadFile(
                    input_folder_id, fp, 'mesh.pyfrm', size=size,
                    parentType='folder')
                kwargs['meshFileId'] = girder_file['_id']

            task.logger.info('Upload complete.')

            task.logger.info('Updating backend configuration.')

        finally:
            if os.path.exists(input_path):
                os.remove(input_path)
            if os.path.exists(output_dir):
                shutil.rmtree(output_dir)

    update_config_file(task, client, *args, **kwargs)

    create_job.delay(*args, **kwargs)


@cumulus.taskflow.task
def create_job(task, *args, **kwargs):
    task.logger.info('Taskflow %s' % task.taskflow.id)
    task.taskflow.logger.info('Create PyFr job.')
    input_folder_id = kwargs['input']['folder']['id']

    backend = kwargs['backend']['type']

    body = {
        'name': 'pyfr_run',
        'commands': [
            "mpirun -n %s pyfr run -b %s input/mesh.pyfrm input/pyfr.ini" % (kwargs['numberOfProcs'], backend)
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

    submit_pyfr_job.delay(cluster, job, *args, **kwargs)

@cumulus.taskflow.task
def submit_pyfr_job(task, cluster,  job, *args, **kwargs):
    task.logger.info('Submitting job %s to cluster.' % job['_id'])
    girder_token = task.taskflow.girder_token

    job['params'] = kwargs
    submit_job(cluster, job, log_write_url=None,
                          girder_token=girder_token, monitor=False)

    monitor_pyfr_job.delay(cluster, job, *args, **kwargs)

@cumulus.taskflow.task
def monitor_pyfr_job(task, cluster, job, *args, **kwargs):
    task.logger.info('Monitoring job on cluster.')
    girder_token = task.taskflow.girder_token

    monitor_job.apply_async((cluster, job), {'girder_token': girder_token,
                                             'monitor_interval': 30},
                            link=upload_output.s(cluster, job, *args, **kwargs))

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

def create_export_job(task, job_name, files, job_dir):

    commands = []
    mesh_file_path = os.path.join(job_dir, 'input', MESH_FILENAME)
    for file in files:
        name = file['name']
        vtk_filename = '%s.vtu' % name.rsplit('.', 1)[0]
        output_path = os.path.join(job_dir, vtk_filename)
        solution_file_path = os.path.join(job_dir, name)

        cmd = 'pyfr export %s %s %s' % (mesh_file_path,
                                       solution_file_path, output_path)
        commands.append(cmd)

    body = {
        'name': job_name,
        'commands': commands,
        'input': [],
        'output': []
    }

    client = _create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)

    job = client.post('jobs', data=json.dumps(body))

    task.logger.info('Created export job %s' % job['_id'])

    return job

@cumulus.taskflow.task
def upload_export_output(task, _, cluster, job, *args, **kwargs):
    output_folder_id = kwargs['output']['folder']['id']

    client = _create_girder_client(
        task.taskflow.girder_api_url, task.taskflow.girder_token)

    for job_id in task.taskflow.get_metadata('export_jobs')['export_jobs']:
        # Get job
        job = client.get('jobs/%s' % job_id)
        job['output'] = [{
            'folderId': output_folder_id,
            'path': '.'
        }]
        upload_job_output_to_folder(cluster, job, log_write_url=None, job_dir=None,
                                    girder_token=task.taskflow.girder_token)

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

    mesh_file_id = kwargs.pop('meshFileId')

    solution_files = list(_list_solution_files(client, output_folder_id))
    number_files = len(solution_files)

    # By default export solution files to VTK format using a set of batch jobs
    if not 'exportInTaskFlow' in kwargs or not kwargs['exportInTaskFlow']:

        number_of_jobs = kwargs['numberOfProcs']
        task.logger.info('Generating %d export jobs' % number_of_jobs)

        sim_job_dir = job['dir']
        jobs = []
        job_index = 1
        for chunk in [solution_files[i::number_of_jobs] for i in xrange(number_of_jobs)]:
            if chunk:
                name = 'pyfr_export_%d' % job_index
                export_job = create_export_job(task, name, chunk, sim_job_dir)
                submit_job(cluster, export_job, log_write_url=None,
                              girder_token=task.taskflow.girder_token, monitor=False)
                jobs.append(export_job)
                job_index += 1

        # Update the jobs list in the metadata
        task.taskflow.set_metadata('jobs', [j for j in jobs] +
                                   [job])
        # Also save just the export job ids
        task.taskflow.set_metadata('export_jobs', [j['_id'] for j in jobs])

        monitor_jobs.apply_async(
            (cluster, jobs), {'girder_token': task.taskflow.girder_token},
            link=upload_export_output.s(cluster, job, *args, **kwargs))
    else:
        # The number 100 is pretty arbitrary!
        if number_files < 100:
            export_output.delay(
                output_folder_id, mesh_file_id, solution_files)
        # Break into chunks a run in parallel
        else:
            for chunk in [solution_files[i::NUMBER__OF_EXPORT_TASKS] for i in xrange(NUMBER__OF_EXPORT_TASKS)]:
                export_output.delay(output_folder_id, mesh_file_id, chunk)


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
