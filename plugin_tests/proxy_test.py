from tests import base
import json
import dbm
import urllib
import os


def setUpModule():
    base.enabledPlugins.append('cumulus')
    base.enabledPlugins.append('pvwproxy')
    base.startServer()


def tearDownModule():
    base.stopServer()


class ProxyTestCase(base.TestCase):

    def setUp(self):
        super(ProxyTestCase, self).setUp()

        self._proxy_file_path = '/tmp/proxy'
        os.remove('%s.db' % self._proxy_file_path)

        users = ({
            'email': 'cumulus@email.com',
            'login': 'cumulus',
            'firstName': 'First',
            'lastName': 'Last',
            'password': 'goodpassword'
        }, {
            'email': 'regularuser@email.com',
            'login': 'regularuser',
            'firstName': 'First',
            'lastName': 'Last',
            'password': 'goodpassword'
        }, {
            'email': 'another@email.com',
            'login': 'another',
            'firstName': 'First',
            'lastName': 'Last',
            'password': 'goodpassword'
        })
        self._cumulus, self._user, self._another_user = \
            [self.model('user').createUser(**user) for user in users]

        self._group = self.model('group').createGroup('cumulus', self._cumulus)

        # Create test job
        body = {
            'onComplete': {
                'cluster': 'terminate'
            },
            'input': [
                {
                    'itemId': '546a1844ff34c70456111185',
                    'path': ''
                }
            ],
            'commands': [
                ''
            ],
            'name': 'test',
            'output': {
                'itemId': '546a1844ff34c70456111185'
            }
        }

        json_body = json.dumps(body)
        r = self.request('/jobs', method='POST',
                         type='application/json', body=json_body, user=self._user)

        self.assertStatus(r, 201)
        self._job_id = r.json['_id']

        # Create test config
        body = {
            'config': {
                'cluster': [{
                    'default_cluster': {}
                }],
            'name': 'test'
            }
        }
        body = json.dumps(body)

        r = self.request('/starcluster-configs', method='POST',
                         type='application/json', body=body, user=self._cumulus)
        self.assertStatus(r, 201)
        config_id = r.json['_id']

        # Create test cluster
        body = {
            'config': [
                {
                    '_id': config_id
                }
            ],
            'name': 'test',
            'template': 'default_cluster'
        }

        json_body = json.dumps(body)

        r = self.request('/clusters', method='POST',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 201)
        self._cluster_id = r.json['_id']

    def test_add_entry(self):
        host = 'some.com'
        port = 8080
        body = {
            'clusterId': self._cluster_id,
            'jobId': self._job_id,
            'host': host,
            'port': port
        }

        json_body = json.dumps(body)

        r = self.request('/proxy', method='PATCH',
                         type='application/json', body=json_body, user=self._user)

        self.assertStatusOk(r)

        db = dbm.open(self._proxy_file_path)
        keys = db.keys()
        self.assertEqual(len(keys), 1)
        expected_key = urllib.quote_plus('%s/%s' % (self._cluster_id, self._job_id))
        self.assertEquals(keys[0], expected_key)
        expected_value = '%s:%s' % (host, port)
        self.assertEquals(db[keys[0]], expected_value)

    def test_add_entry_invalid(self):
        host = 'some.com'
        port = 8080
        body = {
            'clusterId': 'bogus',
            'jobId': self._job_id,
            'host': host,
            'port': port
        }

        json_body = json.dumps(body)
        r = self.request('/proxy', method='PATCH',
                         type='application/json', body=json_body, user=self._user)

        self.assertStatus(r, 400)

        body = {
            'jobId': self._job_id,
            'host': host,
            'port': port
        }

        json_body = json.dumps(body)
        r = self.request('/proxy', method='PATCH',
                         type='application/json', body=json_body, user=self._user)

        self.assertStatus(r, 400)

        body = {
            'clusterId': self._cluster_id,
            'jobId': 'bogus',
            'host': host,
            'port': port
        }

        json_body = json.dumps(body)
        r = self.request('/proxy', method='PATCH',
                         type='application/json', body=json_body, user=self._user)

        self.assertStatus(r, 400)



