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

# TODO: move to base class?
def update_config_file(task, client, *args, **kwargs):

    ini_file_id = kwargs['input']['iniFile']['id']

    _, path = tempfile.mkstemp()

    task.logger.info('Downloading configuration file.')
    try:
        with open(path, 'w') as fp:
            client.downloadFile(ini_file_id, path)

        config_parser = SafeConfigParser()
        config_parser.optionxform = str
        config_parser.read(path)

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

    # Get the mesh file metadata to see if we need to import
    geometry_file = client.getResource('file/%s' % geometry_file_id)

    if number_of_procs > 1:
        task.logger.info('Downloading input mesh.')

        try:
            _, input_path = tempfile.mkstemp()
            output_dir =  tempfile.mkdtemp()
            # TODO: probably to rework this so it works for xyz and pdb files
            geometry_filename = '%s.xyz' % (geometry_file['name'].rsplit('.', 1)[0])
            output_path = os.path.join(output_dir, geometry_filename)
            kwargs['geometryFilename'] = geometry_filename

            client.downloadFile(geometry_file_id, input_path)
            task.logger.info('Downloading complete.')

            task.logger.info('Uploading converted mesh.')
            size = os.path.getsize(output_path)
            with open(output_path) as fp:
                girder_file = client.uploadFile(
                    input_folder_id, fp, geometry_filename, size=size,
                    parentType='folder')
                kwargs['geometryFileId'] = girder_file['_id']

            task.logger.info('Upload complete.')

        finally:
            if os.path.exists(input_path):
                os.remove(input_path)
            if os.path.exists(output_dir):
                shutil.rmtree(output_dir)

    update_config_file(task, client, *args, **kwargs)

    ini_file_id = kwargs['input']['iniFile']['id']
    ini_file = client.getResource('file/%s' % ini_file_id)
    kwargs['iniFilename'] = ini_file['name']

    create_job.delay(*args, **kwargs)


@cumulus.taskflow.task
def create_job(task, *args, **kwargs):
    task.logger.info('Taskflow %s' % task.taskflow.id)
    task.taskflow.logger.info('Create PyFr job.')
    input_folder_id = kwargs['input']['folder']['id']

    # TODO: setup command to run with mpi
    body = {
        'name': 'nwchem_run',
        'commands': [
            "nwchem input/%s" % (kwargs['iniFilename'])
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

NUMBER__OF_EXPORT_TASKS = 10

# TODO: list all possible nwchem file types
def _list_solution_files(client, folder_id):
    """
    List the NWChem solution files held in a Girder folder.

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

        # TODO: Be more selective of the files listed.
        file = files[0]
        yield file

# TODO: is this needed for nwchem?
def create_export_job(task, job_name, files, job_dir, geometry_filename):

    commands = []
    geometry_file_path = os.path.join(job_dir, 'input', geometry_filename)
    for file in files:
        name = file['name']
        vtk_filename = '%s.vtu' % name.rsplit('.', 1)[0]
        output_path = os.path.join(job_dir, vtk_filename)
        solution_file_path = os.path.join(job_dir, name)

        cmd = 'nwchem export %s %s %s' % (geometry_file_path,
                                       solution_file_path, output_path)
        commands.append(cmd)

    body = {
        'name': job_name,
        'commands': commands,
        'input': [],
        'output': [],
        'params': {
            'numberOfSlots': 1
        }
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
        export_job = client.get('jobs/%s' % job_id)
        export_job['output'] = [{
            'folderId': output_folder_id,
            'path': '.'
        }]

        upload_job_output_to_folder(cluster, export_job, log_write_url=None,
            job_dir=None, girder_token=task.taskflow.girder_token)

    # Upload the vtu files
    girder_token = task.taskflow.girder_token
    download_path_from_cluster(cluster, girder_token, output_folder_id, job['dir'],
                               include=['^.*\\.vtu$'])


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

    geometry_file_id = kwargs.pop('geometryFileId')

    solution_files = list(_list_solution_files(client, output_folder_id))

    if len(solution_files) == 0:
        raise Exception('No solution files where produced, please check output files for errors.')

    # Generate and save the first vtu file that should be loaded for this
    # run. This can then be used to know which file to open as part of any viz
    # step.
    file_names = [f['name'] for f in solution_files]
    file_names.sort()
    vtu_file = '%s.vtu' % file_names[0].rsplit('.', 1)[0]
    task.taskflow.set_metadata('vtuFile', vtu_file)

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
                name = 'nwchem_export_%d' % job_index
                geometry_filename = kwargs['geometryFilename']
                export_job = create_export_job(
                    task, name, chunk, sim_job_dir, geometry_filename)
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
                output_folder_id, geometry_file_id, solution_files)
        # Break into chunks a run in parallel
        else:
            for chunk in [solution_files[i::NUMBER__OF_EXPORT_TASKS] for i in xrange(NUMBER__OF_EXPORT_TASKS)]:
                export_output.delay(output_folder_id, geometry_file_id, chunk)


def _export_file(task, client, output_folder_id, geometry_path, file, output_dir):
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
    _export_solution(task.logger, geometry_path, solution_file_path, vtk_file_path)
    with open(vtk_file_path, 'r') as fp:
        size = os.path.getsize(vtk_file_path)
        client.uploadFile(
            output_folder_id, fp, vtk_filename, size=size,
            parentType='folder')


@cumulus.taskflow.task
def export_output(task, folder_id, imported_geometry_file_id, files):
    """
    Export a batch of NWChem solution files into VTK format.

    :param: folder_id: The target folder id to upload the VTK files to.
    :param: imported_geometry_file_id: The mesh in NWChem format
    :param: files: The files to export ( Girder JSON objects )
    """
    client = _create_girder_client(
        task.taskflow.girder_api_url, task.taskflow.girder_token)

    output_dir =  tempfile.mkdtemp()

    try:
        geometry_path = os.path.join(output_dir, 'mesh.nwchemm')

        task.logger.info('Downloading mesh.')
        client.downloadFile(imported_geometry_file_id, geometry_path)
        task.logger.info('Downloading complete.')

        for file in files:
            _export_file(task, client, folder_id, geometry_path, file, output_dir)

    finally:
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
