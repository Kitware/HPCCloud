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

from bson.objectid import ObjectId

from girder.utility.model_importer import ModelImporter
from girder.models.model_base import ValidationException
from girder.constants import AccessType


def get_hpccloud_folder(user):
    """
    Get the users HPCCloud folder. If the folder doesn't exist it is created.
    :param user: The user to get the folder for.
    """
    filters = {
        'name': 'Private'
    }

    try:
        private_folder = ModelImporter.model('folder').childFolders(
            parentType='user', user=user, parent=user, filters=filters,
            limit=1).next()
    except StopIteration:
        raise Exception('Unable to find users private folder')

    # Now see if we already have a HPCCloud folder
    filters = {
        'name': 'HPCCloud'
    }

    hpccloud_folder = None
    try:
        hpccloud_folder = ModelImporter.model('folder').childFolders(
            parentType='folder', user=user, parent=private_folder,
            filters=filters, limit=1).next()
    except StopIteration:
        pass

    if hpccloud_folder:
        return hpccloud_folder

    # Create the folder
    return ModelImporter.model('folder').createFolder(
        private_folder, 'HPCCloud', description='Folder for HPCCloud data',
        parentType='folder', creator=user)


def get_simulations_folder(user, project):

    project_folder = ModelImporter.model('folder').load(
        project['folderId'], user=user, level=AccessType.READ)

    filters = {
        'name': '_simulations'
    }

    try:
        simulations_folder = ModelImporter.model('folder').childFolders(
            parentType='folder', user=user, parent=project_folder,
            filters=filters, limit=1).next()
    except StopIteration:
        raise Exception('Unable to find project simulations folder')

    return simulations_folder


def to_object_id(id):
    if id and type(id) is not ObjectId:
        try:
            id = ObjectId(id)
        except Exception:
            raise ValidationException('Invalid ObjectId: %s' % id)

    return id


def share_folder(owner, folder, users, groups, level=AccessType.READ,
                 recurse=False):
    folder_access_list = folder['access']
    folder_access_list['users'] \
        = [user for user in folder_access_list['users']
           if user != owner['_id']]
    folder_access_list['groups'] = []

    for user_id in users:
        access_object = {
            'id': to_object_id(user_id),
            'level': level
        }
        folder_access_list['users'].append(access_object)

        # Give read access to the project folder
        folder_access_list['users'].append(access_object)

    for group_id in groups:
        access_object = {
            'id': to_object_id(group_id),
            'level': level
        }
        folder_access_list['groups'].append(access_object)

        # Give read access to the project folder
        folder_access_list['groups'].append(access_object)

    return ModelImporter.model('folder').setAccessList(
        folder, folder_access_list, save=True, recurse=recurse, user=owner)
