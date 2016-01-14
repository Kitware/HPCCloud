#!/usr/bin/env python
# -*- coding: utf-8 -*-

###############################################################################
#  Copyright 2016 Kitware Inc.
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

import json

from tests import base


def setUpModule():
    base.enabledPlugins.append('hpccloud')
    base.startServer()


def tearDownModule():
    base.stopServer()


class SimulationTestCase(base.TestCase):

    def setUp(self):
        super(SimulationTestCase, self).setUp()

        users = ({
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
        self._user, self._another_user = \
            [self.model('user').createUser(**user) for user in users]

        # Create a test project
        self._project_name = 'myProject'
        body = {
            'name': self._project_name,
            'type': 'PyFR',
            'steps': ['onestep']
        }

        json_body = json.dumps(body)

        r = self.request('/projects', method='POST',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 201)
        self._project = r.json

    def test_create(self):
        body = {
            "name": "mySim",
            "steps": {
                "step1": {
                    "type": "input"
                },
                "step2": {
                    "type": "input"
                },
                "step3": {
                    "type": "input"
                }
            }
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s/simulations' % str(self._project['_id']), method='POST',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 201)
        self.assertEqual(r.json['projectId'], self._project['_id'])
        self.assertTrue('step1' in r.json['steps'])
        self.assertTrue('step2' in r.json['steps'])
        self.assertTrue('step3' in r.json['steps'])
        for _, step in r.json['steps'].iteritems():
            self.assertEqual(step['status'], 'created')

        # Assert that a folder has been created for this simulation
        self.assertIsNotNone(
            self.model('folder').load(r.json['folderId'], force=True))

