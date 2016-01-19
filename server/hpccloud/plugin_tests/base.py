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

from tests import base


class TestCase(base.TestCase):

    def create_file(self, user, item, name, contents):
        r = self.request(
            path='/file', method='POST', user=user, params={
                'parentType': 'item',
                'parentId': item['_id'],
                'name': name,
                'size': len(contents),
                'mimeType': 'application/octet-stream'
            })
        self.assertStatusOk(r)
        upload = r.json

        # Upload some content
        fields = [('offset', 0), ('uploadId', upload['_id'])]
        files = [('chunk', name, contents)]
        r = self.multipartRequest(
            path='/file/chunk', user=self._another_user, fields=fields, files=files)
        self.assertStatusOk(r)

        return r.json

