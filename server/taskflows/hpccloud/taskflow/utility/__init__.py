import json
from jsonpath_rw import parse

import cumulus

def get_cluster_job_output_dir(cluster):
    job_output_dir \
        = parse('config.jobOutputDir').find(cluster)
    if job_output_dir:
        job_output_dir = job_output_dir[0].value
    else:
        job_output_dir = None

    return job_output_dir

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
