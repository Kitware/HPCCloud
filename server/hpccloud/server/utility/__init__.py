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

import os
import json
import six

from bson.objectid import ObjectId

from girder.utility.model_importer import ModelImporter
from girder.models.model_base import ValidationException
from girder.constants import AccessType

from ..constants import SIMULATIONS_FOLDER


def get_hpccloud_folder(user):
    """
    Get the users HPCCloud folder. If the folder doesn't exist it is created.
    :param user: The user to get the folder for.
    """
    filters = {
        'name': 'Private'
    }

    try:
        private_folder = six.next(ModelImporter.model('folder').childFolders(
            parentType='user', user=user, parent=user, filters=filters,
            limit=1))
    except StopIteration:
        raise Exception('Unable to find users private folder')

    # Now see if we already have a HPCCloud folder
    filters = {
        'name': 'HPCCloud'
    }

    hpccloud_folder = None
    try:
        hpccloud_folder = six.next(ModelImporter.model('folder').childFolders(
            parentType='folder', user=user, parent=private_folder,
            filters=filters, limit=1))
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
        'name': SIMULATIONS_FOLDER
    }

    try:
        simulations_folder = six.next(
            ModelImporter.model('folder').childFolders(
                parentType='folder', user=user, parent=project_folder,
                filters=filters, limit=1))
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


def unshare_folder(owner, folder, users, groups, recurse=False):
    folder_access_list = folder['access']

    for user_id in users:
        ind = 0
        for user in folder_access_list['users']:
            if user_id == user['id']:
                break
            ind += 0
        del folder_access_list['users'][ind]

    for group_id in groups:
        ind = 0
        for group in folder_access_list['groups']:
            if group_id == group['id']:
                break
            ind += 0
        del folder_access_list['groups'][ind]

    return ModelImporter.model('folder').setAccessList(
        folder, folder_access_list, save=True, recurse=recurse, user=owner)


def _list_item(item, prefix, export):
    """
    Generate a list of files within a item.
    :param item: The item to list.
    :param prefix: A path prefix to add to the results.
    :type prefix: str
    :param export: List of fileId to include in export.
    :type export: list
    :returns: Iterable over files in this item, where each element is a
              tuple of (path name of the file, stream function with file
              data).
    :rtype: generator(str, func)
    """
    item_model = ModelImporter.model('item')
    file_model = ModelImporter.model('file')
    files = list(item_model.childFiles(item=item, limit=2))
    path = prefix
    if (len(files) != 1 or files[0]['name'] != item['name']):
            path = os.path.join(prefix, item['name'])
    for file in item_model.childFiles(item=item):
        if not export or file['_id'] in export:
            yield (os.path.join(path, file['name']),
                   file_model.download(file, headers=False))


def _list_folder(user, folder, prefix='', export=None, skip_folders=[]):
    """
    Generate a list of files within a folder.
    :param folder: The folder to list.
    :param user: A user used to validate data that is returned.
    :param prefix: A path prefix to add to the results.
    :type prefix: str
    :param export: List of fileId to include in export.
    :type export: list
    :returns: Iterable over files in this folder, where each element is a
              tuple of (path name of the file, stream function with file
              data).
    :rtype: generator(str, func)
    """
    path = os.path.join(prefix, folder['name'])
    folder_model = ModelImporter.model('folder')

    for sub in folder_model.childFolders(parentType='folder', parent=folder,
                                         user=user):

        if sub['name'] in skip_folders:
            continue

        for (filepath, file) in _list_folder(
                user, sub, path, export):
            yield (filepath, file)

    for item in folder_model.childItems(folder=folder):
        for (filepath, file) in _list_item(
                item, path, export):
            yield (filepath, file)


def list_simulation_assets(user, simulation):
    """
    Generate a list of assets within a simulation, including project related
    inputs.

    :param user: The user to use for access.
    :param simulation: The simulation to list.
    :returns: Iterable over assets in this simulation, where each element is a
              tuple of (path name of the file, stream function with file
              data).
    :rtype: generator(str, func)
    """

    # First list project assets
    project = ModelImporter.model('project', 'hpccloud').load(
        simulation['projectId'], user=user, level=AccessType.READ)

    def stream_project_meta():
        yield json.dumps(project.get('metadata', {}))

    yield (os.path.join(project['name'], 'meta.json'), stream_project_meta)

    project_folder = ModelImporter.model('folder').load(
        project['folderId'], user=user, level=AccessType.READ)

    for (filepath, file) in _list_folder(user, project_folder,
                                         prefix='', export=None,
                                         skip_folders=[SIMULATIONS_FOLDER]):
        yield (filepath, file)

    prefix = os.path.join(project['name'], simulation['name'])

    # Now list the simulation steps
    for step_name, step in six.iteritems(simulation['steps']):
        # Export the metadata
        def stream_step_meta():
            yield json.dumps(step.get('metadata', {}))

        path = os.path.join(prefix, step['type'])
        yield (os.path.join(path, step_name, 'meta.json'), stream_step_meta)
        step_folder = ModelImporter.model('folder').load(
            step['folderId'], user=user, level=AccessType.READ)
        for (filepath, file) in _list_folder(user, step_folder, path,
                                             export=step.get('export')):
            yield (filepath, file)
