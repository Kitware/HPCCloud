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
from base import TestCase

get_hpccloud_folder = None

def setUpModule():
    base.enabledPlugins.append('hpccloud')
    base.startServer()
    global get_hpccloud_folder
    from girder.plugins.hpccloud.utility import get_hpccloud_folder


def tearDownModule():
    base.stopServer()


class ProjectsTestCase(TestCase):

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
        project_name = 'myProject'
        body = {
            'name': project_name,
            'type': 'PyFR',
            'steps': ['onestep']
        }

        json_body = json.dumps(body)

        r = self.request('/projects', method='POST',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 201)

        # Check that a project folder was created
        hpccloud_folder = get_hpccloud_folder(user=self._user)
        filters = {
            'name': project_name
        }
        project_folder = self.model('folder').childFolders(
            parentType='folder', user=self._user, parent=hpccloud_folder,
            filters=filters, limit=1)

        self.assertEqual(len(list(project_folder)), 1)

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
            'type': 'FooBar'
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s' % str(project['_id']), method='PATCH',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 400)

        # Now try add some bogus data to our project
        body = {
            'metadata': {
                'foo': 'bogus'
            }
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s' % str(project['_id']), method='PATCH',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 200)

        # Check the data was added
        project_model = self.model('project', 'hpccloud').load(project['_id'], force=True)
        self.assertEqual(project_model['metadata'], body['metadata'])

        # Now try changing the name
        body = {
            'name': 'FooBar'
        }

        json_body = json.dumps(body)
        r = self.request('/projects/%s' % str(project['_id']), method='PATCH',
                         type='application/json', body=json_body, user=self._user)
        self.assertStatus(r, 200)

        # Check the name was updated
        project_model = self.model('project', 'hpccloud').load(project['_id'], force=True)
        self.assertEqual(project_model['name'], body['name'])

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

        body = {
            'name': 'deleteme',
            'type': 'PyFR',
            'steps': ['onestep']
        }

        json_body = json.dumps(body)
        r = self.request('/projects', method='POST',
                         type='application/json', body=json_body,
                         user=self._another_user)
        self.assertStatus(r, 201)
        project = r.json

        project_folder = self.model('folder').load(
            project['folderId'], user = self._another_user)

        # Create a test folder
        folder = self.model('folder').createFolder(project_folder,
                                                   'Delete me please',
                                                   creator=self._another_user)

        # Create a test item
        item = self.model('item').createItem('deleteme', self._another_user,
                                             project_folder)

        # Create a test file
        r = self.request(path='/assetstore', method='GET',
                         user=self._user)
        self.assertStatusOk(r)
        self.assertEqual(1, len(r.json))
        assetstore = r.json[0]

        file_item = self.model('item').createItem('fileItem', self._another_user,
                                             project_folder)
        file = self.model('file').createFile(self._another_user, file_item,
                                             'test', 100, assetstore)
        file['sha512'] = 'dummy'
        self.model('file').save(file)

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

        # Check that the project folder was remove
        self.assertIsNone(self.model('folder').load(project['folderId'],
                                                    force=True))

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
                         user=self._yet_another_user)
        self.assertStatus(r, 200)

        # We should now have access to both projects
        r = self.request('/projects', method='GET',
                         type='application/json', user=self._another_user)
        self.assertStatus(r, 200)
        self.assertEqual(len(r.json), 2)

        # Check we have read access to the project folder
        r = self.request('/folder/%s' % str(project1['folderId']), method='GET',
                         type='application/json', user=self._another_user)
        self.assertStatus(r, 200)
        self.assertEqual(r.json['_id'], project1['folderId'])

        # Check that owner still has access
        r = self.request('/projects/%s' % str(project1['_id']), method='GET',
                 type='application/json', user=self._yet_another_user)
        self.assertStatus(r, 200)
        self.assertEqual(r.json['_id'], project1['_id'])
