#!/usr/bin/env python
# -*- coding: utf-8 -*-

###############################################################################
#  Copyright 2015 Kitware Inc.
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

from tests import base
import json
import dbm
import urllib
import os


def setUpModule():
    base.enabledPlugins.append('pvwproxy')
    base.startServer()


def tearDownModule():
    base.stopServer()


class ProxyTestCase(base.TestCase):

    def setUp(self):
        super(ProxyTestCase, self).setUp()

        self._proxy_file_path = '/tmp/proxy'
        full_path = '%s.db' % self._proxy_file_path
        if os.path.exists(full_path):
            os.remove(full_path)

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

    def test_add_entry(self):
        host = 'some.com'
        port = 8080
        key = 'mykey'
        body = {
            'key': key,
            'host': host,
            'port': port
        }

        json_body = json.dumps(body)

        r = self.request('/proxy', method='POST',
                         type='application/json', body=json_body, user=self._user)

        self.assertStatusOk(r)

        db = dbm.open(self._proxy_file_path)
        keys = db.keys()
        self.assertEqual(len(keys), 1)
        expected_key = urllib.quote_plus('%s/%s' % (self._cluster_id, self._job_id))
        self.assertEquals(keys[0], expected_key)
        expected_value = '%s:%s' % (host, port)
        self.assertEquals(db[keys[0]], expected_value)




