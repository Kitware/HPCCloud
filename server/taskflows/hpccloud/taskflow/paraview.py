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
from jsonpath_rw import parse

import cumulus.taskflow.cluster
from cumulus.taskflow.cluster import create_girder_client
from cumulus.tasks.job import submit_job, monitor_job
from cumulus.tasks.job import upload_job_output_to_folder, job_directory
from cumulus.transport import get_connection
from cumulus.transport.files.upload import upload_file

from hpccloud.taskflow.utility import *

class ParaViewTaskFlow(cumulus.taskflow.cluster.ClusterProvisioningTaskFlow):
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

    PARAVIEW_IMAGE = {
        'owner': '695977956746',
        'tags': {
            'paraview': '5.0.1'
        }
    }

    def start(self, *args, **kwargs):
        image_spec = self.PARAVIEW_IMAGE.copy()
        # Setup up image spec
        if '_id' not in kwargs['cluster']:
            if has_gpus(kwargs['cluster']):
                image_spec['tags']['cuda'] = '7.5'
                image_spec['tags']['nvida_display_driver'] = '367.35'
            else:
                image_spec['tags']['mesa'] = '8.0'

        kwargs['image_spec'] = image_spec
        kwargs['next'] = create_paraview_job.s()

        super(ParaViewTaskFlow, self).start(self, *args, **kwargs)

    def terminate(self):
        super(ParaViewTaskFlow, self).terminate()
        self.run_task(cleanup_proxy_entries.s())

    def delete(self):
        super(ParaViewTaskFlow, self).delete()
        self.run_task(cleanup_proxy_entries.s())

def validate_args(kwargs):
    required = ['cluster.config.paraview.installDir', 'sessionKey']

    for r in required:
        if not parse(r).find(kwargs):
            raise Exception('Required parameter %s not provide to taskflow.'
                            %  r)

    if not parse('dataDir') and not parse('input.file.id'):
        raise Exception('\'dataDir\' or \'input.file.id\' must be provided.')


@cumulus.taskflow.task
def paraview_terminate(task):
    cluster = parse('meta.cluster').find(task.taskflow)
    if cluster:
        cluster = cluster[0].value
    else:
        task.logger.warning('Unable to extract cluster from taskflow. '
                         'Unable to terminate ParaView job.')

    client = create_girder_client(
            task.taskflow.girder_api_url, task.taskflow.girder_token)

    jobs = task.taskflow.get('meta', {}).get('jobs', [])
    terminate_jobs(task, client, cluster, jobs)

def _update_cluster_config(task, cluster):
    if cluster['type'] == 'ec2':
        paraview_config = cluster['config'].setdefault('paraview', {})
        paraview_config['installDir'] = '/opt/paraview'
        paraview_config['websocketPort'] = 9000

        # Update ParaView config on cluster
        client = create_girder_client(
            task.taskflow.girder_api_url, task.taskflow.girder_token)
        client.patch('clusters/%s' % cluster['_id'],
                     data=json.dumps({
                        'config': {
                            'paraview': cluster['config']['paraview']
                        }
                    }))

@cumulus.taskflow.task
def create_paraview_job(task, *args, **kwargs):
    _update_cluster_config(task, kwargs['cluster'])
    task.logger.info('Validating args passed to flow.')
    validate_args(kwargs)
    cluster = kwargs.pop('cluster')

    # Save the cluster in the taskflow for termination
    task.taskflow.set_metadata('cluster', cluster)

    client = create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)

    task.taskflow.logger.info('Creating ParaView job.')
    task.logger.info('Load ParaView submission script.')

    base_path = os.path.dirname(__file__)
    script_path = os.path.join(base_path, 'pvw.sh')

    if not os.path.exists(script_path):
        msg = 'Script path %s does not exists.' % script_path
        task.logger.info(msg)
        raise Exception(msg)

    with open(script_path, 'r') as fp:
        commands = fp.read().splitlines()

    body = {
        'name': 'paraview',
        'commands': commands,
        'input': [],
        'output': []
    }

    job = client.post('jobs', data=json.dumps(body))
    task.logger.info('ParaView job created: %s' % job['_id'])
    task.taskflow.logger.info('ParaView job created.')

    task.taskflow.set_metadata('jobs', [job])

    # Upload the visualizer code
    task.logger.info('Uploading visualizer')
    viz_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), '../',  '../', '../','../',
            'node_modules/pvw-visualizer/server/pvw-visualizer.py'))

    if not os.path.exists(viz_path):
        task.logger.error('Unable to local pvw-visualizer.py for upload.')
        return

    target_dir = job_directory(cluster, job)
    target_path = os.path.join(target_dir, 'pvw-visualizer.py')

    with get_connection(task.taskflow.girder_token, cluster) as conn:
        conn.makedirs(target_dir)
        with open(viz_path, 'r') as fp:
            conn.put(fp, target_path)

    submit_paraview_job.delay(cluster, job,  *args, **kwargs)

def upload_input(task, cluster, job, *args, **kwargs):
    file_id = parse('input.file.id').find(kwargs)
    if file_id:
        file_id = file_id[0].value
        task.logger.info('Visualizing file ID: %s' % file_id)
        job['params']['dataDir'] = '.'

        # Fetch the file
        girder_client = create_girder_client(
            task.taskflow.girder_api_url, task.taskflow.girder_token)
        file = girder_client.getResource('file', file_id)

        # Set the file to load
        filename = file['name']
        job['params']['fileName'] = filename
        task.logger.info('Filename is: %s' % filename)

        task.logger.info('Uploading file to cluster.')
        job_dir = job_directory(cluster, job)
        upload_file(cluster, task.taskflow.girder_token, file, job_dir)
        task.logger.info('Upload complete.')

def create_proxy_entry(task, cluster, job):
    session_key = job['params']['sessionKey']
    host = cluster['config']['host']
    body = {
        'host': host,
        'port': cluster['config']['paraview']['websocketPort'],
        'key': session_key
    }
    client = create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)
    client.post('proxy', data=json.dumps(body))

@cumulus.taskflow.task
def submit_paraview_job(task, cluster, job, *args, **kwargs):
    task.taskflow.logger.info('Submitting job to cluster.')
    girder_token = task.taskflow.girder_token

    params = {}

    if 'dataDir' in kwargs:
        params['dataDir'] = kwargs['dataDir']

    if 'fileName' in kwargs:
        params['fileName'] = kwargs['fileName']

    if 'simulationJobId' in kwargs:
        params['simulationJobId'] = kwargs['simulationJobId']

    if 'sessionKey' in kwargs:
        params['sessionKey'] = kwargs['sessionKey']
        # Save the sessionKey so we can clean up the proxy entry
        task.taskflow.set_metadata('sessionKey', kwargs['sessionKey'])

    if 'numberOfSlots' in kwargs:
        params['numberOfSlots'] = kwargs['numberOfSlots']

    parallel_environment \
        = parse('config.parallelEnvironment').find(cluster)

    if parallel_environment:
        parallel_environment = parallel_environment[0].value
        params['parallelEnvironment'] = parallel_environment

    job_output_dir = get_cluster_job_output_dir(cluster)
    if job_output_dir:
        params['jobOutputDir'] = job_output_dir

    paraview_install_dir \
        = parse('config.paraview.installDir').find(cluster)
    if paraview_install_dir:
        paraview_install_dir = paraview_install_dir[0].value
        params['paraviewInstallDir'] = paraview_install_dir

    # Does the cluster have GPUs?
    params['gpu'] = has_gpus(cluster) or kwargs.get('numberOfGpusPerNode', 0) > 0

    job['params'] = params

    # Create proxy entry
    if cluster['type'] == 'ec2':
        create_proxy_entry(task, cluster, job)

    # Before we submit the job upload any file we may have been given
    upload_input(task, cluster, job, *args, **kwargs)

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

    # Refresh state of job
    client = create_girder_client(
            task.taskflow.girder_api_url, task.taskflow.girder_token)
    job = client.get('jobs/%s' % job['_id'])

    output_folder_id = parse('output.folder.id').find(kwargs)
    if output_folder_id:
        output_folder_id = output_folder_id[0].value
        job['output'] = [{
            'folderId': output_folder_id,
            'path': '.'
        }]

    upload_job_output_to_folder(cluster, job, log_write_url=None, job_dir=None,
                                girder_token=task.taskflow.girder_token)

    task.taskflow.logger.info('Upload complete.')

@cumulus.taskflow.task
def cleanup_proxy_entries(task):
    client = create_girder_client(
                task.taskflow.girder_api_url, task.taskflow.girder_token)

    session_key = parse('meta.sessionKey').find(task.taskflow)
    if session_key:
        session_key = session_key[0].value
        client.delete('proxy/%s' % session_key)
