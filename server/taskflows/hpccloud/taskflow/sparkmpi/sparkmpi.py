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

class SparkMpiTaskFlow(cumulus.taskflow.cluster.ClusterProvisioningTaskFlow):
    """
    {
        "dataDir": <passed to --data-dir,
        "cluster": {
            "_id": <this id of the cluster to run on>
        }
    }
    """

