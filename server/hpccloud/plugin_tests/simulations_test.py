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
import zipfile
import io
import six

from tests import base
from .base import TestCase

def setUpModule():
    base.enabledPlugins.append('hpccloud')
    base.startServer()


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
        description = 'My description'
        body = {
            'name': 'mySim',
            'description': description,
            'steps': {
                'step1': {
                    'type': 'input'
                },
                'step2': {
                    'type': 'input'
                },
                'step3': {
                    'type': 'input'
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
        self.assertEqual(r.json['description'], description)
        for _, step in six.iteritems(r.json['steps']):
            self.assertEqual(step['status'], 'created')

        # Assert that a folder has been created for this simulation
        self.assertIsNotNone(
            self.model('folder').load(r.json['folderId'], force=True))

        # Assert that a folder has been created for each step
        for _, step in six.iteritems(r.json['steps']):
            self.assertIsNotNone(self.model('folder').load(
                step['folderId'], force=True))


    def _create_simulation(self, project, user, name):
        body = {
            'name': name,
            'steps': {
                'step1': {
                    'type': 'input'
                },
                'step2': {
                    'type': 'input'
                },
                'step3': {
                    'type': 'input'
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

    def test_update(self):
        sim = self._create_simulation(
            self._project1, self._another_user, 'sim')

        # First try to update an immutable property
        body = {
            'folderId': 'notthanks'
        }

        json_body = json.dumps(body)
        r = self.request('/simulations/%s' % str(sim['_id']), method='PATCH',
                         type='application/json', body=json_body, user=self._another_user)
        self.assertStatus(r, 400)


        new_name = 'billy bob'
        # Now try updating the name
        body = {
            'name': new_name
        }

        json_body = json.dumps(body)
        r = self.request('/simulations/%s' % str(sim['_id']), method='PATCH',
                         type='application/json', body=json_body, user=self._another_user)
        self.assertStatusOk(r)
        # Assert that the new name was added to the document
        self.assertEqual(self.model('simulation', 'hpccloud').load(sim['_id'], force=True)['name'],
                         new_name)

    def test_clone(self):
        test_meta ={
            'test': True
        }

        body = {
            'name': 'testing',
            'steps': {
                'step1': {
                    'type': 'input'
                },
                'step2': {
                    'type': 'input'
                },
                'step3': {
                    'type': 'output',
                    'metadata': test_meta
                }
            }
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s/simulations' % str(self._project1['_id']), method='POST',
                         type='application/json', body=json_body, user=self._another_user)
        self.assertStatus(r, 201)
        sim = r.json

        step1_folder = self.model('folder').load(sim['steps']['step1']['folderId'], force=True)
        # Add some test data to one of the simulation steps
        # Create a test item
        step1_item = self.model('item').createItem('deleteme', self._another_user,
                                             step1_folder)

        # Create a test file
        r = self.request(path='/assetstore', method='GET',
                         user=self._user)
        self.assertStatusOk(r)
        self.assertEqual(1, len(r.json))
        assetstore = r.json[0]

        step1_file_item = self.model('item').createItem('fileItem', self._another_user,
                                             step1_folder)
        step1_file = self.model('file').createFile(self._another_user, step1_file_item,
                                             'test', 100, assetstore)
        step1_file['sha512'] = 'dummy'
        self.model('file').save(step1_file)

        # Add some test data to output step
        # Create a test item
        step3_folder = self.model('folder').load(sim['steps']['step3']['folderId'], force=True)
        step3_item = self.model('item').createItem('deleteme', self._another_user,
                                             step3_folder)

        # Create a test file
        r = self.request(path='/assetstore', method='GET',
                         user=self._user)
        self.assertStatusOk(r)
        self.assertEqual(1, len(r.json))
        assetstore = r.json[0]

        step3_file_item = self.model('item').createItem('fileItem', self._another_user,
                                             step3_folder)
        step3_file = self.model('file').createFile(self._another_user, step3_file_item,
                                             'test', 100, assetstore)
        step3_file['sha512'] = 'dummy'
        self.model('file').save(step3_file)

        # Now share the project and clone
        body = {
            'users': [str(self._yet_another_user['_id'])]
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s/share' % str(self._project1['_id']), method='PUT',
                         type='application/json', body=json_body, user=self._another_user)
        self.assertStatusOk(r)

        # First try without providing a name
        body = {

        }
        json_body = json.dumps(body)
        r = self.request('/simulations/%s/clone' % str(sim['_id']), method='POST',
                         type='application/json', body=json_body, user=self._another_user)
        self.assertStatus(r, 400)

        name = 'iamaclone'
        body = {
            'name': name
        }
        json_body = json.dumps(body)
        r = self.request('/simulations/%s/clone' % str(sim['_id']), method='POST',
                         type='application/json', body=json_body, user=self._yet_another_user)
        self.assertStatus(r, 201)
        cloned = r.json

        self.assertEqual(cloned['name'], name)
        steps = cloned['steps']
        self.assertEqual(len(steps), 3)
        self.assertEqual(steps['step3']['metadata'], test_meta)

        # Assert that we have new folders
        self.assertNotEqual(steps['step1']['folderId'], sim['steps']['step1']['folderId'])
        self.assertNotEqual(steps['step2']['folderId'], sim['steps']['step2']['folderId'])
        self.assertNotEqual(steps['step3']['folderId'], sim['steps']['step3']['folderId'])

        # Assert the step3 data was not copied
        cloned_step3_folder = self.model('folder').load(steps['step3']['folderId'], force=True)
        items = self.model('folder').childItems(cloned_step3_folder)
        self.assertFalse(list(items))

        # Assert that step1 data was copied
        cloned_step1_folder = self.model('folder').load(steps['step1']['folderId'], force=True)
        items = list(self.model('folder').childItems(cloned_step1_folder))

        self.assertEqual(len(items), 2)

        cloned_step1_item, cloned_step1_file_item = items

        self.assertNotEqual(step1_item, cloned_step1_item)
        self.assertNotEqual(step1_file_item, cloned_step1_file_item)
        self.assertEqual(cloned_step1_item['name'], 'deleteme')
        self.assertEqual(cloned_step1_file_item['name'], 'fileItem')

        # Check we have our file as well
        files = list(self.model('item').childFiles(cloned_step1_file_item))
        self.assertEqual(len(files), 1)

    def test_get_simulation_step(self):
        sim = self._create_simulation(
            self._project1, self._another_user, 'sim1')

        # First try a bogus step
        r = self.request('/simulations/%s/steps/bogus' % str(sim['_id']), method='GET',
                         type='application/json', user=self._another_user)
        self.assertStatus(r, 400)

        # Now get step1
        r = self.request('/simulations/%s/steps/step1' % str(sim['_id']), method='GET',
                         type='application/json', user=self._another_user)
        self.assertStatus(r, 200)
        step = r.json
        self.assertEqual(step['type'],'input')
        self.assertEqual(step['status'],'created')
        self.assertTrue('folderId' in step)

    def test_update_simulation_step(self):
        sim = self._create_simulation(
            self._project1, self._another_user, 'sim1')

        body = {
            'metadata': {
                'name': 'name'
            }
        }
        json_body = json.dumps(body)
        # First try a bogus step
        r = self.request('/simulations/%s/steps/bogus' % str(sim['_id']), method='PATCH',
                         type='application/json', body=json_body, user=self._another_user)
        self.assertStatus(r, 400)

        # Try immutable property
        body = {
            'folderId': 'noway'
        }
        json_body = json.dumps(body)
        # Now update step1
        r = self.request('/simulations/%s/steps/step1' % str(sim['_id']), method='PATCH',
                         type='application/json', body=json_body,  user=self._another_user)
        self.assertStatus(r, 400)

        # Try bogus property
        body = {
            'bogus': 'noway'
        }
        json_body = json.dumps(body)
        # Now update step1
        r = self.request('/simulations/%s/steps/step1' % str(sim['_id']), method='PATCH',
                         type='application/json', body=json_body,  user=self._another_user)
        self.assertStatus(r, 400)

        # Now try something valid
        body = {
            'metadata': {
                'name': 'name'
            },
            'status': 'complete',
            'export': []
        }
        json_body = json.dumps(body)
        # Now update step1
        r = self.request('/simulations/%s/steps/step1' % str(sim['_id']), method='PATCH',
                         type='application/json', body=json_body,  user=self._another_user)
        self.assertStatus(r, 200)

        # Assert things where updated
        new_sim = self.model('simulation', 'hpccloud').load(sim['_id'], force=True)
        new_step1 = new_sim['steps']['step1']
        self.assertEqual(new_step1['status'], 'complete')
        self.assertEqual(new_step1['metadata'], body['metadata'])
        self.assertEqual(new_step1['export'], body['export'])

    def test_download(self):
        test_meta ={
            'test': True
        }

        body = {
            'name': 'testing',
            'steps': {
                'step1': {
                    'type': 'input'
                },
                'step2': {
                    'type': 'input'
                },
                'step3': {
                    'type': 'output',
                    'metadata': test_meta
                }
            }
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s/simulations' % str(self._project1['_id']), method='POST',
                         type='application/json', body=json_body, user=self._another_user)
        self.assertStatus(r, 201)
        sim = r.json

        step1_folder = self.model('folder').load(sim['steps']['step1']['folderId'], force=True)
        # Add some test data to one of the simulation steps
        # Create a test item
        self.model('item').createItem('deleteme', self._another_user,
                                      step1_folder)

        step1_file_item = self.model('item').createItem('step1.txt', self._another_user,
                                             step1_folder)

        self.create_file(self._another_user, step1_file_item, 'step1.txt', 'step1')

        # Add some test data to output step
        # Create a test item
        step3_folder = self.model('folder').load(sim['steps']['step3']['folderId'], force=True)
        step3_file_item = self.model('item').createItem('step3.txt', self._another_user,
                                      step3_folder)

        # Create a test file
        self.create_file(self._another_user, step3_file_item, 'step3.txt', 'step3')

        r = self.request('/simulations/%s/download' % str(sim['_id']), method='GET',
                         isJson=False, user=self._another_user)
        self.assertStatusOk(r)

        self.assertEqual(r.headers['Content-Type'], 'application/zip')
        zip = zipfile.ZipFile(io.BytesIO(self.getBody(r, text=False)), 'r')
        self.assertTrue(zip.testzip() is None)

        expected = [
            'project1/meta.json',
            'project1/testing/input/step1/meta.json',
            'project1/testing/input/step1/step1.txt',
            'project1/testing/input/step2/meta.json',
            'project1/testing/output/step3/meta.json',
            'project1/testing/output/step3/step3.txt'
        ]
        self.assertEqual(sorted([i.filename for i in zip.infolist()]), expected)
        step3_txt = zip.read('project1/testing/output/step3/step3.txt').decode('utf8')
        self.assertEqual(step3_txt, 'step3')
        step3_meta = json.loads(zip.read('project1/testing/output/step3/meta.json').decode('utf8'))
        self.assertEqual(step3_meta, test_meta)


