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
    upload = ModelImporter.model('upload')
    with ProgressContext(True, interval=1.0, message=files[0]['name'],
                         user=user, token=token,
                         total=totalsize, title='Moving files') as ctx:
        for file in files:
            ctx.update(message=file['name'])
            upload.moveFileToAssetstore(
                file=file, user=user, assetstore=assetstore, progress=ctx)


@describeRoute(
    Description('Copy a set of files')
    .param('body', 'An array of file objects',
           dataType='json', required=True, paramType='body')
)
@access.user
def move_files(params):
    def load_file(file):
        return ModelImporter.model('file').load(file['_id'],
                                                user=getCurrentUser())
    files = map(load_file, getBodyJson())
    total_size = sum([file['size'] for file in files])
    move_files_to_assetstore(files, total_size)


def load(apiRoot):
    apiRoot.file.route('PUT', ('move',), move_files)
