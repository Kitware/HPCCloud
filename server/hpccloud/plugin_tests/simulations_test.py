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

        def create_project(name):
            # Create a test project
            body = {
                'name': name,
                'type': 'PyFR',
                'steps': ['onestep']
            }

            json_body = json.dumps(body)

            r = self.request('/projects', method='POST',
                             type='application/json', body=json_body, user=self._another_user)
            self.assertStatus(r, 201)
            return r.json

        self._project1 = create_project('project1')
        self._project2 = create_project('project2')

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
        r = self.request('/projects/%s/simulations' % str(self._project1['_id']), method='POST',
                         type='application/json', body=json_body, user=self._another_user)
        self.assertStatus(r, 201)
        self.assertEqual(r.json['projectId'], self._project1['_id'])
        self.assertTrue('step1' in r.json['steps'])
        self.assertTrue('step2' in r.json['steps'])
        self.assertTrue('step3' in r.json['steps'])
        for _, step in r.json['steps'].iteritems():
            self.assertEqual(step['status'], 'created')

        # Assert that a folder has been created for this simulation
        self.assertIsNotNone(
            self.model('folder').load(r.json['folderId'], force=True))

    def _create_simulation(self, project, user, name):
        body = {
            "name": name,
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
        r = self.request('/projects/%s/simulations' % str(project['_id']), method='POST',
                         type='application/json', body=json_body, user=user)
        self.assertStatus(r, 201)

        return r.json

    def test_list_simulations(self):
        self._create_simulation(
            self._project1, self._another_user, 'sim1')
        self._create_simulation(self._project1,
            self._another_user, 'sim2')
        self._create_simulation(self._project2,
            self._another_user, 'sim3')

        r = self.request('/projects/%s/simulations' % str(self._project1['_id']), method='GET',
                         type='application/json', user=self._another_user)
        self.assertStatusOk(r)
        self.assertEqual(len(r.json), 2)

    def test_get(self):
        sim1 = self._create_simulation(
            self._project1, self._another_user, 'sim1')
        self._create_simulation(self._project1,
            self._another_user, 'sim2')
        self._create_simulation(self._project2,
            self._another_user, 'sim3')

        r = self.request('/simulations/%s' % str(sim1['_id']), method='GET',
                         type='application/json', user=self._another_user)
        self.assertStatusOk(r)
        self.assertEqual(r.json['_id'], sim1['_id'])

    def test_delete(self):
        sim = self._create_simulation(
            self._project1, self._another_user, 'sim')

        # Assert that a folder has been created for this simulation
        self.assertIsNotNone(
            self.model('folder').load(sim['folderId'], force=True))

        # Now delete the simulation
        r = self.request('/simulations/%s' % str(sim['_id']), method='DELETE',
                         type='application/json', user=self._another_user)
        self.assertStatusOk(r)

        # Confirm the deletion
        self.assertIsNone(self.model('simulation', 'hpccloud').load(
            sim['_id'], force=True))

        # Confirm that the folder was also removed
        self.assertIsNone(self.model('folder').load(
            sim['folderId'], force=True))
