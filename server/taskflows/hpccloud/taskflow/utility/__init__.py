import json
from jsonpath_rw import parse
from celery.canvas import Signature
import requests

import cumulus
from cumulus.tasks.job import terminate_job
from cumulus.constants import JobState
from cumulus.ansible.tasks.providers import CloudProvider

from girder_client import GirderClient, HttpError

CHECKIP_URL = 'http://checkip.amazonaws.com/'

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

def create_girder_client(girder_api_url, girder_token):
    client = GirderClient(apiUrl=girder_api_url)
    client.token = girder_token

    return client

def create_ec2_cluster(task, cluster, profile, ami):
    machine_type = cluster['machine']['id']
    nodeCount = cluster['clusterSize']-1
    launch_spec = 'ec2'

    # Look up the external IP of the deployment to user for firewall rules
    r = requests.get(CHECKIP_URL)
    r.raise_for_status()
    source_ip = '%s/32' % r.text.strip()

    extra_rules = [{
        'proto': 'tcp',
        'from_port': 9000,
        'to_port': 9000,
        'cidr_ip': source_ip
    }]


    task.logger.info('Using source ip: %s' % source_ip)

    launch_params = {
        'master_instance_type': machine_type,
        'master_instance_ami': ami,
        'node_instance_count': nodeCount,
        'node_instance_type': machine_type,
        'node_instance_ami': ami,
        'gpu': cluster['machine']['gpu'],
        'source_cidr_ip': source_ip,
        'extra_rules': extra_rules
    }
    provision_spec = 'gridengine/site'
    provision_params = {
        'ansible_ssh_user': 'ubuntu'
    }

    body = {
        'type': 'ec2',
        'name': cluster['name'],
         'config': {
            'launch': {
                'spec': launch_spec,
                'params': launch_params
            },
            'provision': {
                'spec': provision_spec
            }
        },
        'profileId': cluster['profileId']
    }
    client = create_girder_client(
        task.taskflow.girder_api_url, task.taskflow.girder_token)

    try:
        cluster = client.post('clusters',  data=json.dumps(body))
    except HttpError as he:
        task.logger.exception(he.responseText)
        raise

    msg = 'Created cluster: %s' % cluster['_id']
    task.taskflow.logger.info(msg)
    task.logger.info(msg)

    # Now save cluster id in metadata
    task.taskflow.set_metadata('cluster', cluster)

    task.logger.info('Starting cluster.')

    body = {
        'status': 'launching'
    }
    client.patch('clusters/%s' % cluster['_id'], data=json.dumps(body))

    secret_key = profile['secretAccessKey']
    profile = profile.copy()
    del profile['secretAccessKey']
    log_write_url = '%s/clusters/%s/log' % (task.taskflow.girder_api_url,
                                            cluster['_id'])
    provision_params['cluster_state'] = 'running'
    launch_params['cluster_state'] = 'running'
    girder_token = task.taskflow.girder_token
    cumulus.ansible.tasks.cluster.start_cluster(
        launch_spec, provision_spec, cluster, profile, secret_key,
        launch_params, provision_params, girder_token, log_write_url)

    # Get the update to date cluster
    cluster = client.get('clusters/%s' % cluster['_id'])

    return cluster

def _get_image(logger, profile, image_spec):
    # Fetch the image from the CloudProvider
    provider = CloudProvider(profile)
    images = provider.get_machine_images(owner=image_spec['owner'],
                                         tags=image_spec['tags'])

    if len(images) == 0:
        raise Exception('Unable to locate machine image for the ' +
                        'following spec: %s' % image_spec)
    elif len(images) > 1:
        logger.warn('Found more than one machine image for the ' +
                    'following spec: %s' % image_spec)

    return images[0]['image_id']

def has_gpus(cluster):
    """
    :param cluster: The cluster passed by the client. Either an created cluster
                    contain a _id or one contain a machine field specify the machine
                    type.
    :type cluster: dict
    :returns: True is cluster nodes have GPUs, false otherwise.
    """

    # First check machine spec
    gpu = parse('machine.gpu').find(cluster)

    if not gpu:
        # Check launch parameters
        gpu = parse('config.launch.params.gpu').find(cluster)

    return gpu and int(gpu[0].value) > 0

@cumulus.taskflow.task
def setup_cluster(task, *args,**kwargs):
    cluster = kwargs['cluster']

    if '_id' in cluster:
        task.taskflow.logger.info('We are using an existing cluster: %s' % cluster['name'])
    else:
        task.taskflow.logger.info('We are creating an EC2 cluster.')
        task.logger.info('Cluster name %s' % cluster['name'])
        kwargs['machine'] = cluster.get('machine')
        profile = kwargs.get('profile')
        ami = _get_image(task.logger, profile, kwargs['image_spec'])
        cluster = create_ec2_cluster(task, cluster, profile, ami)
        task.logger.info('Cluster started.')

    # Call any follow on task
    if 'next' in kwargs:
        kwargs['cluster'] = cluster
        next = Signature.from_dict(kwargs['next'])
        next.delay(*args, **kwargs)
