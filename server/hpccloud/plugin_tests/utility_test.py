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

from girder.utility.model_importer import ModelImporter
from tests import base
from .base import TestCase

list_simulation_assets = None

def setUpModule():
    base.enabledPlugins.append('hpccloud')
    base.startServer()

    global list_simulation_assets
    from hpccloud_plugin.utility import list_simulation_assets


def tearDownModule():
    base.stopServer()


class SimulationTestCase(TestCase):

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
        },
         {
            'email': 'yetanother@email.com',
            'login': 'yetanother',
            'firstName': 'First',
            'lastName': 'Last',
            'password': 'goodpassword'
        })
        self._user, self._another_user,  self._yet_another_user  = \
            [ModelImporter.model('user').createUser(**user) for user in users]

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

    def test_list_assets(self):
        test_meta ={
            'test': True
        }

        body = {
            "name": 'testing',
            "steps": {
                "step1": {
                    "type": "input"
                },
                "step2": {
                    "type": "input"
                },
                "step3": {
                    "type": "output",
                    "metadata": test_meta
                }
            }
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s/simulations' % str(self._project1['_id']), method='POST',
                         type='application/json', body=json_body, user=self._another_user)
        self.assertStatus(r, 201)
        sim = r.json

        step1_folder = ModelImporter.model('folder').load(sim['steps']['step1']['folderId'], force=True)
        # Add some test data to one of the simulation steps
        # Create a test item
        ModelImporter.model('item').createItem('deleteme', self._another_user,
                                      step1_folder)

        step1_file_item = ModelImporter.model('item').createItem('step1.txt', self._another_user,
                                             step1_folder)

        self.create_file(self._another_user, step1_file_item, 'step1.txt', 'step1')

        # Add some test data to output step
        # Create a test item
        step3_folder = ModelImporter.model('folder').load(sim['steps']['step3']['folderId'], force=True)
        step3_file_item = ModelImporter.model('item').createItem('step3.txt', self._another_user,
                                      step3_folder)

        # Create a test file
        self.create_file(self._another_user, step3_file_item, 'step3.txt', 'step3')

        expected = [
            'project1/meta.json',
            'project1/testing/input/step1/meta.json',
            'project1/testing/input/step1/step1.txt',
            'project1/testing/input/step2/meta.json',
            'project1/testing/output/step3/meta.json',
            'project1/testing/output/step3/step3.txt'
        ]

        listing = [ filepath for  (filepath, file) in list_simulation_assets(self._another_user, sim)]
        self.assertEqual(sorted(listing), expected)


