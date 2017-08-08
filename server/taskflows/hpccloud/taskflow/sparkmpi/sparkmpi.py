import json
import os
from jsonpath_rw import parse

import cumulus.taskflow.cluster
from cumulus.taskflow.cluster import create_girder_client
from cumulus.tasks.job import download_job_input_folders
from cumulus.tasks.job import submit_job, monitor_job
from cumulus.tasks.job import job_directory
# from cumulus.transport import get_connection
# from cumulus.transport.files.upload import upload_file

# from hpccloud.taskflow.utility import *


class SparkMpiTaskFlow(cumulus.taskflow.cluster.ClusterProvisioningTaskFlow):
    """
    {
        "dataDir": <passed to --data-dir,
        "cluster": {
            "_id": <this id of the cluster to run on>
        }
    }
    """

    def start(self, *args, **kwargs):
        # kwargs['image_spec'] = image_spec
        kwargs['next'] = create_sparkmpi_job.s()
        super(SparkMpiTaskFlow, self).start(self, *args, **kwargs)

    def terminate(self):
        super(SparkMpiTaskFlow, self).terminate()
        self.run_task(finish.s())

    def delete(self):
        super(SparkMpiTaskFlow, self).delete()
        self.run_task(finish.s())


@cumulus.taskflow.task
def create_sparkmpi_job(task, *args, **kwargs):
    # Girder client
    client = create_girder_client(
        task.taskflow.girder_api_url, task.taskflow.girder_token)

    # Save the cluster in the taskflow for termination
    cluster = kwargs.pop('cluster')
    task.taskflow.set_metadata('cluster', cluster)

    # Create job definition
    task.taskflow.logger.info('Creating SparkMPI job.')

    base_path = os.path.dirname(__file__)
    script_path = os.path.join(base_path, 'start.sh')

    if not os.path.exists(script_path):
        msg = 'Script path %s does not exists.' % script_path
        task.logger.info(msg)
        raise Exception(msg)

    with open(script_path, 'r') as fp:
        commands = fp.read().splitlines()

    body = {
        'name': 'start.sh',
        'commands': commands,
        'input': [],
        'output': []
    }

    # Register job in girder + attach to taskflow
    job = client.post('jobs', data=json.dumps(body))
    task.logger.info('SparkMPI job created: %s' % job['_id'])
    task.taskflow.logger.info('SparkMPI job created.')
    task.taskflow.set_metadata('jobs', [job])

    # Capture job working directory
    target_dir = job_directory(cluster, job)
    task.taskflow.set_metadata('dataDir', target_dir)

    # Move to the next task
    submit_sparkmpi_job.delay(cluster, job, *args, **kwargs)


@cumulus.taskflow.task
def submit_sparkmpi_job(task, cluster, job, *args, **kwargs):
    # Now download job inputs
    task.logger.info('Uploading input files to cluster.')
    download_job_input_folders(cluster, job,
                               log_write_url=None,
                               girder_token=task.taskflow.girder_token,
                               submit=False)
    task.logger.info('Uploading complete.')

    # Setup job parameters
    task.taskflow.logger.info('Submitting job to cluster.')
    job['params'] = {
        'sparkPath': parse('config.sparkmpi.path').find(cluster),
        'sparkSize': kwargs['sparkSize'],
        'mpiSize': kwargs['mpiSize']
    }

    # Submit job to the queue
    submit_job(cluster, job,
               log_write_url=None,
               girder_token=task.taskflow.girder_token,
               monitor=False)

    # Move to the next task
    monitor_sparkmpi_job.delay(cluster, job, *args, **kwargs)


@cumulus.taskflow.task
def monitor_sparkmpi_job(task, cluster, job, *args, **kwargs):
    task.logger.info('Monitoring job on cluster.')

    # Move to next task when monitor job is done
    task.taskflow \
        .on_complete(monitor_job) \
        .run(finish.s(task))

    # Monitor job in a loop manner
    task.taskflow.run_task(
        monitor_job.s(cluster, job, girder_token=task.taskflow.girder_token))


@cumulus.taskflow.task
def finish(task):
    task.taskflow.logger.info('Upload complete.')
