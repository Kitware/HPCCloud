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

from jsonpath_rw import parse
import jsonschema

from girder.models.model_base import ValidationException, AccessControlledModel
from bson.objectid import ObjectId
from girder.constants import AccessType
import schema


class Project(AccessControlledModel):

    def __init__(self):
        super(Project, self).__init__()

    def initialize(self):
        self.name = 'projects'

    def validate(self, project):
        """
        Validate using jsonschema
        """
        try:
            jsonschema.validate(project, schema.project)
        except jsonschema.ValidationError as ve:
            raise ValidationException(ve.message)

        return project

    def create(self, user, project):
        project['userId'] = user['_id']
        project = self.setUserAccess(project, user=user, level=AccessType.ADMIN)
        project = self.save(project)

        return project

    def update(self, user, project, data):
        """
        Update an existing project, this involves update the data property.
        For now we will just do a dict update, in the future we migth want
        more complex merging.
        :param user: The user performing the update
        :param project: The project object being updated
        :param data: The new data object
        :returns: The updated project
        """
        project.setdefault('data', {}).update(data)
        self.save(project)

    def delete(self, user, project):
        """
        Delete a give project.

        This will clean up any folders, item or files associated with it as well
        a removing the document.

        :param user: The user deleting the project
        :param project: The project to delete.
        """

        # Check we can clean up project files
        file_ids = parse('data.fileIds').find(project)
        files = []
        if file_ids:
            file_ids = file_ids[0].value
            model = self.model('file')
            for file_id in file_ids:
                file = model.load(file_id, user=user)
                if not file or not model.hasAccess(file, user=user,
                                                   level=AccessType.ADMIN):
                    raise ValidationException('User %s doesn\'t have admin '
                                              'access to delete file %s'
                                              % (user['_id'], file_id))
                files.append(file)

        # Check we can clean up project items
        item_ids = parse('data.itemIds').find(project)
        items = []
        if item_ids:
            item_ids = item_ids[0].value
            model = self.model('item')
            for item_id in item_ids:
                item = model.load(item_id, user=user)
                if not item or not model.hasAccess(item, user=user,
                                                   level=AccessType.ADMIN):
                    raise ValidationException('User %s doesn\'t have admin '
                                              'access to delete item %s'
                                              % (user['_id'], item_id))
                items.append(item)

        # Check we can clean up project folders
        folder_ids = parse('data.folderIds').find(project)
        folders = []
        if folder_ids:
            folder_ids = folder_ids[0].value
            model = self.model('folder')
            for folder_id in folder_ids:
                folder = model.load(folder_id, user=user)
                if not folder or not model.hasAccess(folder, user=user,
                                                     level=AccessType.ADMIN):
                    raise ValidationException('User %s doesn\'t have admin '
                                              'access to delete folder %s'
                                              % (user['_id'], folder_id))
                folders.append(folder)

        # Now delete the files
        model = self.model('file')
        for file in files:
            model.remove(file)

        # Now delete the items
        model = self.model('item')
        for items in items:
            model.remove(item)

        # Now delete the folders
        model = self.model('folder')
        for folder in folders:
            model.remove(folder)

        super(Project, self).remove(project)

    def _to_object_id(self, id):
        if id and type(id) is not ObjectId:
            try:
                id = ObjectId(id)
            except Exception:
                raise ValidationException('Invalid ObjectId: %s' % id)

        return id

    def share(self, sharer, project, users, groups):
        """
        Share a give project.
        :param sharer: The user sharing the project
        :param project: The project being shared
        :param users: The users to share the project with.
        :param groups: The groups to share the project with.
        """
        access_list = project['access']

        access_list['users'] \
            = [user for user in access_list['users'] if user != sharer['_id']]
        access_list['groups'] = []

        for user_id in users:
            access_list['users'].append({
                'id': self._to_object_id(user_id),
                'level': AccessType.READ
            })

        for group_id in groups:
            access_list['groups'].append({
                'id': self._to_object_id(group_id),
                'level': AccessType.READ
            })

        # TODO when we have simulation associated with a project we will have to
        # share them as well.

        return self.save(project)
