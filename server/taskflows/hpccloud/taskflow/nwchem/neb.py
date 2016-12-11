import cumulus.taskflow.cluster
from cumulus.taskflow.cluster import create_girder_client
from cumulus.tasks.job import submit_job, _monitor_jobs
from cumulus.tasks.job import download_job_input_folders
from cumulus.tasks.job import upload_job_output_to_folder, job_directory
from cumulus.transport import get_connection
from . import setup_input, create_job, submit, submit_nwchem_job, \
    monitor_nwchem_job, upload_output


from hpccloud.taskflow.utility import *

import sys

class NWChemTaskFlow(cumulus.taskflow.cluster.ClusterProvisioningTaskFlow):
    """
    {
        "input": {
            "folder": {
                "id": <the id of the folder containing input files>
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

        kwargs['next'] = (
            setup_input.s() | \
            create_job.s() | \
            submit.s() | \
            submit_nwchem_job.s() | \
            monitor_nwchem_job.s().set(queue='monitor') | \
            upload_output.s() )

        super(NWChemTaskFlow, self).start(self, *args, **kwargs)
