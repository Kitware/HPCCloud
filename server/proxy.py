import cherrypy
import json
import dbm
import urllib
import constants
from girder.api.rest import Resource
from girder.api import access
from girder.api.describe import Description
from girder.constants import AccessType
from girder.api.docs import addModel
from girder.api.rest import RestException
from lockfile import LockFile

class Proxy(Resource):
    def __init__(self):
        self.resourceName = 'proxy'
        self.route('POST', (), self.add_entry)
        self.route('DELETE', (':cluster_id', ':job_id'), self.delete_entry)
        self._proxy_file_path = self.model('setting').get(
            constants.PluginSettings.PROXY_FILE_PATH, '/tmp/proxy')

    @access.public
    def add_entry(self, params):
        body = json.loads(cherrypy.request.body.read())

        if 'clusterId' not in body:
            raise RestException('clusterId is required', code=400)
        if 'jobId' not in body:
            raise RestException('jobId is required', code=400)
        if 'host' not in body:
            raise RestException('host is required', code=400)
        if 'port' not in body:
            raise RestException('port is required', code=400)

        cluster_id = body['clusterId']
        job_id = body['jobId']

        # Check that the cluster and job exist
        cluster = self.model('cluster', 'cumulus').load(cluster_id, force=True)
        if not cluster:
            raise RestException('Invalid clusterId', code=400)

        job = self.model('job', 'cumulus').load(job_id, force=True)
        if not job:
            raise RestException('Invalid jobId', code=400)

        host = body['host']
        port = body['port']

        with LockFile(self._proxy_file_path):
            db = None
            try:
                db = dbm.open(self._proxy_file_path, 'c')
                key = '%s/%s' % (cluster_id, job_id)
                # Encode the slash
                key =  urllib.quote_plus(key)
                db[key] = '%s:%s' % (host, port)
            finally:
                if db:
                    db.close()

    addModel('ProxyEntry', {
        'id':'ProxyEntry',
        'required': ['commands', 'name', 'outputCollectionId'],
        'properties':{
            'clusterId': {
                'pattern': '^[0-9a-fA-F]{24}$',
                'type': 'string'
            },
            'jobId': {
                'pattern': '^[0-9a-fA-F]{24}$',
                'type': 'string'
            },
           'host': {
                'type': 'string'
            },
           'port': {
                'type': 'integer'
            }
        }
    })

    add_entry.description = (Description(
            'Add entry to the proxy file'
        )
        .param(
            'body',
            'The proxy entry parameters.', dataType='ProxyEntry', paramType='body', required=True))

    @access.public
    def delete_entry(self, cluster_id, job_id, params):
        # Check that the cluster and job exist
        cluster = self.model('cluster', 'cumulus').load(cluster_id, force=True)
        if not cluster:
            raise RestException('Invalid cluster_id', code=400)

        job = self.model('job', 'cumulus').load(job_id, force=True)
        if not job:
            raise RestException('Invalid job_id', code=400)

        with LockFile(self._proxy_file_path):
            db = None
            try:
                db = dbm.open(self._proxy_file_path, 'c')
                key = '%s/%s' % (cluster_id, job_id)
                # Encode the slash
                key =  urllib.quote_plus(key)
                if key in db:
                    del db[key]
            finally:
                if db:
                    db.close()

    delete_entry.description = (Description(
            'Delete entry'
        )
        .param(
            'cluster_id',
            'The cluster the job was submitted to.', dataType='string',
            paramType='path', required=True)
        .param('job_id',
            'The job the proxy entry was create for.', dataType='string',
            paramType='path', required=True))
