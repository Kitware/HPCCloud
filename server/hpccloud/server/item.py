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

from girder.api import access
from girder.api.describe import Description, describeRoute
from girder.utility.progress import ProgressContext
from girder.api.rest import getBodyJson, getCurrentUser, ModelImporter


def move_files_to_assetstore(files, totalsize):
    user, token = getCurrentUser(True)
    assetstore = ModelImporter.model('assetstore').getCurrent()
    progress_context = ProgressContext(True, interval=1.0,
                                       user=user, token=token,
                                       total=totalsize, title=files[0]['name'])
    current_progress = 0
    for file in files:
        ModelImporter.model('upload').moveFileToAssetstore(
            file=file, user=user, assetstore=assetstore)
        progress_context.update(current=current_progress, title=file['name'])
        current_progress += file['size']

    return progress_context


@describeRoute(
    Description('Copy a set of files')
    .param('body', 'An array of file id\'s',
           dataType='json', required=True, paramType='body')
)
@access.user
def copy_files(params):
    itemIds = getBodyJson()
    files = []
    for _id in itemIds:
        item = ModelImporter.model('item').load(_id, user=getCurrentUser())
        files += ModelImporter.model('item').childFiles(item, limit=50)

    total_size = sum([file['size'] for file in files])
    move_files_to_assetstore(files, total_size)


def load(apiRoot):
    apiRoot.item.route('POST', ('copy',), copy_files)
