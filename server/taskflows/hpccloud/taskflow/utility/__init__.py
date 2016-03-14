import json
from jsonpath_rw import parse

from cumulus.starcluster.tasks.job import terminate_job
from cumulus.constants import JobState


def terminate_jobs(task, client, cluster, jobs):
    for job in jobs:
        task.logger.info('Terminating job %s' % job['_id'])
        # Fetch the latest job info
        job_url = 'jobs/%s' % job['_id']
        job = client.get(job_url)

        # Update the status to terminating
        body = {
            'status': JobState.TERMINATING
        }
        client.patch(job_url, data=json.dumps(body))

        terminate_job(
            cluster, job, log_write_url=None,
            girder_token=task.taskflow.girder_token)

def get_cluster_job_output_dir(cluster):
    job_output_dir \
        = parse('config.jobOutputDir').find(cluster)
    if job_output_dir:
        job_output_dir = job_output_dir[0].value
    else:
        job_output_dir = None

    return job_output_dir

