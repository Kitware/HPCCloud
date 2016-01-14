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


class ProjectsTestCase(base.TestCase):

    def setUp(self):
        super(ProjectsTestCase, self).setUp()

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
        self._user, self._another_user, self._yet_another_user = \
            [self.model('user').createUser(**user) for user in users]

    def test_create(self):
        body = {
            'name': 'myProject',
            'type': 'PyFR',
            'steps': ['onestep']
        }

        json_body = json.dumps(body)

        r = self.request('/projects', method='POST',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 201)

        # Test missing name
        body = {
            'type': 'PyFR',
            'steps': ['onestep']
        }

        json_body = json.dumps(body)

        r = self.request('/projects', method='POST',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 400)

    def test_update(self):
        body = {
            'name': 'myProject',
            'type': 'PyFR',
            'steps': ['onestep']
        }

        json_body = json.dumps(body)
        r = self.request('/projects', method='POST',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 201)
        project = r.json

        # Now try and update one of the immutable properties
        body = {
            'name': 'myProject'
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s' % str(project['_id']), method='PUT',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 400)

        # Now try add some bogus data to our project
        body = {
            'data': {
                'foo': 'bogus'
            }
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s' % str(project['_id']), method='PUT',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 400)

        # Now try add some bogus id data to our project
        body = {
            'data': {
                'folderIds': ['bogus']
            }
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s' % str(project['_id']), method='PUT',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 400)

        # Now try add a valid id data to our project
        body = {
            'data': {
                'folderIds': ['56957192b4a9e33d39ec48a5']
            }
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s' % str(project['_id']), method='PUT',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 200)

        # Check the id was added
        project_model = self.model('project', 'hpccloud').load(project['_id'], force=True)
        self.assertEqual(body['data'], project_model['data'])

    def _create_project(self, name, user):
        body = {
            'name': name,
            'type': 'PyFR',
            'steps': ['onestep']
        }

        json_body = json.dumps(body)
        r = self.request('/projects', method='POST',
                         type='application/json', body=json_body,
                         user=user)
        self.assertStatus(r, 201)
        return r.json


    def test_get_all(self):

        self._create_project('project1', self._user)
        project2 = self._create_project('project2', self._another_user)

        r = self.request('/projects', method='GET',
                         type='application/json', user=self._another_user)
        self.assertStatus(r, 200)
        self.assertEqual(len(r.json), 1)
        self.assertEqual(r.json[0], project2)

    def test_delete(self):

        # Create a test folder
        # Grab the user public folder
        params = {
            'parentType': 'user',
            'parentId': self._another_user['_id'],
            'sort': 'name',
            'sortdir': 1
        }

        r = self.request(path='/folder', method='GET', user=self._another_user,
                         params=params)
        self.assertStatusOk(r)
        public_folder = r.json[1]

        params={
            'name': 'Delete me please',
            'parentId': public_folder['_id']
        }
        # Create a test folder
        folder = self.model('folder').createFolder(public_folder,
                                                   'Delete me please',
                                                   creator=self._another_user)

        # Create a test item
        item = self.model('item').createItem('deleteme', self._another_user,
                                             public_folder)

        # Create a test file
        r = self.request(path='/assetstore', method='GET', user=self._user)
        self.assertStatusOk(r)
        self.assertEqual(1, len(r.json))
        assetstore = r.json[0]

        file_item = self.model('item').createItem('fileItem', self._another_user,
                                             public_folder)
        file = self.model('file').createFile(self._another_user, file_item,
                                             'test', 100, assetstore)
        file['sha512'] = 'dummy'
        self.model('file').save(file)

        body = {
            'name': 'deleteme',
            'type': 'PyFR',
            'steps': ['onestep'],
            'data': {
                'folderIds': [str(folder['_id'])],
                'itemIds': [str(item['_id'])],
                'fileIds': [str(file['_id'])]
            }
        }

        json_body = json.dumps(body)
        r = self.request('/projects', method='POST',
                         type='application/json', body=json_body,
                         user=self._another_user)
        self.assertStatus(r, 201)
        project = r.json

        # Now delete the project
        r = self.request('/projects/%s' % str(project['_id']), method='DELETE',
                         type='application/json', body=json_body,
                         user=self._another_user)
        self.assertStatusOk(r)

        # Check that the project was deleted
        self.assertIsNone(self.model('project', 'hpccloud').load(project['_id'],
                                                                 force=True))

        # Check that the folder was deleted
        self.assertIsNone(self.model('folder').load(folder['_id'], force=True))

        # Check that the item was deleted
        self.assertIsNone(self.model('item').load(item['_id'], force=True))

        # Check that the file was deleted
        self.assertIsNone(self.model('file').load(file['_id'], force=True))

    def test_get(self):
        project1 = self._create_project('project1', self._user)
        project2 = self._create_project('project2', self._another_user)

        r = self.request('/projects/%s' % str(project2['_id']), method='GET',
                         type='application/json', user=self._another_user)
        self.assertStatus(r, 200)
        self.assertEqual(r.json, project2)

        # Now try and get a project we shouldn't have access to
        r = self.request('/projects/%s' % str(project1['_id']), method='GET',
                         type='application/json', user=self._another_user)
        self.assertStatus(r, 403)

    def test_share(self):
        project1 = self._create_project('project1', self._yet_another_user)
        project2 = self._create_project('project2', self._another_user)

        r = self.request('/projects', method='GET',
                         type='application/json', user=self._another_user)
        self.assertStatus(r, 200)
        self.assertEqual(len(r.json), 1)
        self.assertEqual(r.json[0], project2)

        # Now share the other project
        body = {
            'users': [str(self._another_user['_id'])]
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s/share' % str(project1['_id']),
                         method='PUT', type='application/json', body=json_body,
                         user=self._user)
        self.assertStatus(r, 200)

        # We should now have access to both projects
        r = self.request('/projects', method='GET',
                         type='application/json', user=self._another_user)
        self.assertStatus(r, 200)
        self.assertEqual(len(r.json), 2)

        # Check that owner still has access
        r = self.request('/projects/%s' % str(project1['_id']), method='GET',
                 type='application/json', user=self._yet_another_user)
        self.assertStatus(r, 200)
        self.assertEqual(r.json['_id'], project1['_id'])
