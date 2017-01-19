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
import json
import os
import subprocess
import shutil
from backports.tempfile import TemporaryDirectory
from jsonpath_rw import parse
from celery.exceptions import Retry

import cumulus.taskflow.cluster
from cumulus.taskflow.cluster import create_girder_client
from cumulus.tasks.job import submit_job, _monitor_jobs
from cumulus.tasks.job import download_job_input_folders
from cumulus.tasks.job import upload_job_output_to_folder, job_directory
from cumulus.transport import get_connection

from hpccloud.taskflow.utility import *

class NWChemTaskFlow(cumulus.taskflow.cluster.ClusterProvisioningTaskFlow):
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
        kwargs['image_spec'] = self.NWCHEM_IMAGE

        # Define the flow using a chain
        kwargs['next'] = (
            setup_input.s() | \
            create_job.s() | \
            submit.s() | \
            submit_nwchem_job.s() | \
            monitor_nwchem_job.s().set(queue='monitor') | \
            create_json_output.s() | \
            upload_output.s() )

        super(NWChemTaskFlow, self).start(self, *args, **kwargs)



def create_geometry_symlink(task, job, cluster, fileName):
    job_dir = job_directory(cluster, job)
    filePath = '%s/%s/%s' % (job_dir, job['input'][0]['path'], fileName)
    linkPath = '%s/%s' % (job_dir, fileName)
    with get_connection(task.taskflow.girder_token, cluster) as conn:
        conn.execute('ln -s %s %s' % (filePath, linkPath))


@cumulus.taskflow.task
def setup_input(task, *args, **kwargs):
    input_folder_id = kwargs['input']['folder']['id']

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

    client = create_girder_client(
        task.taskflow.girder_api_url, task.taskflow.girder_token)

    geometry_file_id = parse('input.geometryFile.id').find(kwargs)
    if geometry_file_id:
        geometry_file_id = geometry_file_id[0].value
        kwargs['geometryFileId'] = geometry_file_id

        # Get the geometry file metadata to see if we need to import
        geometry_file = client.getResource('file/%s' % geometry_file_id)
        kwargs['geometryFilename'] = geometry_file['name']

    ini_file_id = kwargs['input']['nwFile']['id']
    ini_file = client.getResource('file/%s' % ini_file_id)
    kwargs['nwFilename'] = ini_file['name']

    return kwargs


@cumulus.taskflow.task
def create_job(task, upstream_result):
    task.logger.info('Taskflow %s' % task.taskflow.id)
    task.taskflow.logger.info('Create NWChem job.')
    input_folder_id = upstream_result['input']['folder']['id']

    body = {
        'name': 'nwchem_run',
        'commands': [
            "mpiexec -n %s nwchem input/%s &> nwchem_run.out" % (
                upstream_result['numberOfProcs'],
                upstream_result['nwFilename'])
        ],
        'input': [
            {
              'folderId': input_folder_id,
              'path': 'input'
            }
        ],
        'output': [],
        'params': {
            'numberOfSlots': upstream_result['numberOfProcs']
        }
    }

    client = create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)

    job = client.post('jobs', data=json.dumps(body))
    upstream_result['job'] = job

    task.taskflow.set_metadata('jobs', [job])

    return upstream_result


@cumulus.taskflow.task
def submit(task, upstream_result):
    task.taskflow.logger.info('Submitting job to cluster.')
    girder_token = task.taskflow.girder_token
    cluster = upstream_result['cluster']
    job = upstream_result['job']
    task.taskflow.set_metadata('cluster', cluster)

    # Now download and submit job to the cluster
    task.logger.info('Uploading input files to cluster.')
    download_job_input_folders(cluster, job, log_write_url=None,
                        girder_token=girder_token, submit=False)

    if 'geometryFilename' in upstream_result:
        create_geometry_symlink(task, job, cluster, upstream_result['geometryFilename'])

    task.logger.info('Uploading complete.')

    return upstream_result

@cumulus.taskflow.task
def submit_nwchem_job(task, upstream_result):
    job = upstream_result['job']
    task.logger.info('Submitting job %s to cluster.' % job['_id'])
    girder_token = task.taskflow.girder_token
    cluster = upstream_result['cluster']

    job_params = upstream_result.copy()
    job_params.pop('cluster')
    job_params.pop('job')
    job['params'].update(job_params)

    submit_job(cluster, job, log_write_url=None,
                          girder_token=girder_token, monitor=False)

    return upstream_result

@cumulus.taskflow.task
def monitor_nwchem_job(task, upstream_result):
    task.logger.info('Monitoring job on cluster.')
    girder_token = task.taskflow.girder_token
    cluster = upstream_result['cluster']


    task.max_retries = None
    task.throws=(Retry,),

    job = upstream_result['job']
    _monitor_jobs(task, cluster, [job], girder_token=girder_token, monitor_interval=30)

    return upstream_result

@cumulus.taskflow.task
def create_json_output(task, upstream_result):
    task.logger.info('Converting nwchem output to json format.')
    cluster = upstream_result['cluster']
    job = upstream_result['job']
    job_dir = job_directory(cluster, job)
    out_file = '%s.out' % (job['name'])

    with TemporaryDirectory() as tmp_dir:
        # Copy the nwchem output to server
        cluster_path = os.path.join(job_dir, out_file)
        local_path = os.path.join(tmp_dir, out_file)
        with open(local_path, 'w') as local_fp:
            with get_connection(task.taskflow.girder_token, cluster) as conn:
                with conn.get(cluster_path) as remote_fp:
                    local_fp.write(remote_fp.read())

        # Run docker container to post-process results - need to add docker image to upstream_result
        command = ['docker', 'run', '--rm', '-v', '%s:/hpccloud' % tmp_dir,
                'chetnieter/nwchem-postprocess', out_file]
        p = subprocess.Popen(args=command, stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE)
        stdout, stderr = p.communicate()

        if p.returncode != 0:
            task
            task.logger.error('Error running Docker container.')
            task.logger.error('STDOUT: ' + stdout)
            task.logger.error('STDERR: ' + stderr)
            raise Exception('Docker returned code {}.'.format(p.returncode))

        # Copy json file back to cluster?
        cluster_path = os.path.join(job_dir, out_file + '.json')
        local_path = os.path.join(tmp_dir, out_file + '.json')
        with get_connection(task.taskflow.girder_token, cluster) as conn:
            with open(local_path, 'r') as local_fp:
                conn.put(local_fp, cluster_path)

    return upstream_result

@cumulus.taskflow.task
def upload_output(task, upstream_result):
    task.taskflow.logger.info('Uploading results from cluster')
    output_folder_id = upstream_result['output']['folder']['id']
    cluster = upstream_result['cluster']
    job = upstream_result['job']

    client = create_girder_client(
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

    return upstream_result
