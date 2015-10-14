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
from girder.api.rest import RestException, getBodyJson
from lockfile import LockFile

class Proxy(Resource):
    def __init__(self):
        self.resourceName = 'proxy'
        self.route('POST', (), self.add_entry)
        self.route('DELETE', (':key'), self.delete_entry)
        self._proxy_file_path = self.model('setting').get(
            constants.PluginSettings.PROXY_FILE_PATH, '/tmp/proxy')

    @access.public
    def add_entry(self, params):
        body = getBodyJson()

        if 'key' not in body:
            raise RestException('key is required', code=400)
        if 'host' not in body:
            raise RestException('host is required', code=400)
        if 'port' not in body:
            raise RestException('port is required', code=400)

        key = body['key']
        host = body['host']
        port = body['port']

        with LockFile(self._proxy_file_path):
            db = None
            try:
                db = dbm.open(self._proxy_file_path, 'c')
                # Encode the slash
                db[key] = '%s:%s' % (host, port)
            finally:
                if db:
                    db.close()

    addModel('ProxyEntry', {
        'id':'ProxyEntry',
        'required': ['key', 'host', 'port'],
        'properties':{
            'key': {
                'type': 'string'
            },
           'host': {
                'type': 'string'
            },
           'port': {
                'type': 'integer'
            }
        }
    }, 'proxy')

    add_entry.description = (Description(
            'Add entry to the proxy file'
        )
        .param(
            'body',
            'The proxy entry parameters.', dataType='ProxyEntry', paramType='body', required=True))

    @access.public
    def delete_entry(self, key):

        with LockFile(self._proxy_file_path):
            db = None
            try:
                db = dbm.open(self._proxy_file_path, 'c')
                if key in db:
                    del db[key]
            finally:
                if db:
                    db.close()

    delete_entry.description = (Description(
            'Delete entry'
        )
        .param(
            'key',
            'The key to delete.', dataType='string',
            paramType='path', required=True))
