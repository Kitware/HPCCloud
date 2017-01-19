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
import tempfile

from tests import base
from .base import TestCase
from girder.constants import AssetstoreType


def setUpModule():
    base.enabledPlugins.append('hpccloud')
    base.startServer()
    global get_hpccloud_folder
    from girder.plugins.hpccloud.utility import get_hpccloud_folder


def tearDownModule():
    base.stopServer()


class FileTestCase(TestCase):

    def setUp(self):
        super(FileTestCase, self).setUp()

        user = {
            'email': 'regularuser@email.com',
            'login': 'regularuser',
            'firstName': 'First',
            'lastName': 'Last',
            'password': 'goodpassword'
        }
        self._user = self.model('user').createUser(**user)

    def test_move_files_offline(self):

        body = {
            'name': 'target_store',
            'type': AssetstoreType.FILESYSTEM,
            'root': tempfile.gettempdir()
        }

        # create target assetstore we're going to move files too
        r = self.request('/assetstore', method='POST',
                         params=body, user=self._user)
        self.assertStatus(r, 200)
        initial_store = r.json

        # get original assetstore
        r = self.request(path='/assetstore', method='GET',
                         user=self._user)
        self.assertStatusOk(r)
        target_store = r.json[0]

        # Create a test folder
        folder = get_hpccloud_folder(user=self._user)

        # create test items
        item_1 = self.model('item').createItem('item_1', self._user,
                                               folder)
        file_1 = self.create_file(self._user, item_1, 'test_1',
                                  'contents of file 1', initial_store['_id'])

        item_2 = self.model('item').createItem('item_2', self._user,
                                               folder)
        file_2 = self.create_file(self._user, item_2, 'test_2',
                                  'contents of file 2', initial_store['_id'])

        self.assertEqual(file_1['assetstoreId'], file_2['assetstoreId'])
        self.assertEqual(str(file_1['assetstoreId']), initial_store['_id'])

        # move files
        move_files_json = json.dumps([file_1, file_2])
        r = self.request(path='/file/move', method='PUT', body=move_files_json,
                         type='application/json', user=self._user)

        # refetch files
        file_1 = self.model('file').load(file_1['_id'], user=self._user)
        file_2 = self.model('file').load(file_2['_id'], user=self._user)

        self.assertNotEqual(file_1['assetstoreId'], initial_store['_id'])
        self.assertEqual(file_1['assetstoreId'], file_2['assetstoreId'])
        self.assertEqual(str(file_1['assetstoreId']), target_store['_id'])

        # ensure we can read the files after transfer
        params = {'contentDisposition': 'inline'}
        fetched_file = self.request(path='/item/%s/download' % item_1['_id'],
                                    method='GET', user=self._user, isJson=False,
                                    params=params)
        self.assertEqual(self.getBody(fetched_file), 'contents of file 1')

        # sse tests
        stream_r = self.request('/notification/stream', method='GET',
                                user=self._user,
                                isJson=False, params={'timeout': 0})
        self.assertStatusOk(stream_r)
        notifications = self.getSseMessages(stream_r)
        # the contents of the fils are small so there's only 1 notification
        self.assertEqual(len(notifications), 1)
        self.assertEqual(notifications[0]['type'], 'progress')
        self.assertEqual(notifications[0]['data']['message'], 'Done')
