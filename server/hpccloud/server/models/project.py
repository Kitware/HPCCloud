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

import jsonschema

from girder.models.model_base import ValidationException, AccessControlledModel
from bson.objectid import ObjectId
from girder.constants import AccessType
import schema

from ..utility import get_hpccloud_folder


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
            ref_resolver = jsonschema.RefResolver.from_schema(
                schema.definitions)
            jsonschema.validate(project, schema.project, resolver=ref_resolver)
        except jsonschema.ValidationError as ve:
            raise ValidationException(ve.message)

        return project

    def create(self, user, project):
        """
        Create a new project

        Create a new folder to associate with this project:

        <user>/Private/HPCCloud/<project>

        """
        project['userId'] = user['_id']

        self.validate(project)

        # We need to create the project folder
        hpccloud_folder = get_hpccloud_folder(user)
        project_folder = self.model('folder').createFolder(
            hpccloud_folder, project['name'], parentType='folder',
            creator=user)

        # Create the sub directory the whole simulations for this project
        self.model('folder').createFolder(
            project_folder, '_simulations', parentType='folder',
            creator=user)

        project['folderId'] = project_folder['_id']
        project = self.setUserAccess(project, user=user, level=AccessType.ADMIN)
        project = self.save(project)

        return project

    def update(self, user, project, metadata):
        """
        Update an existing project, this involves update the data property.
        For now we will just do a dict update, in the future we migth want
        more complex merging.
        :param user: The user performing the update
        :param project: The project object being updated
        :param metadata: The new data object
        :returns: The updated project
        """
        project.setdefault('metadata', {}).update(metadata)
        self.save(project)

    def delete(self, user, project):
        """
        Delete a give project.

        This will clean up any folders, item or files associated with it as well
        a removing the document.

        :param user: The user deleting the project
        :param project: The project to delete.
        """

        # Clean up the project folder
        project_folder = self.model('folder').load(
            project['folderId'], user=user)
        self.model('folder').remove(project_folder)

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

        project_folder = self.model('folder').load(
            project['folderId'], user=sharer)

        folder_access_list = project_folder['access']
        folder_access_list['users'] \
            = [user for user in folder_access_list['users']
               if user != sharer['_id']]
        folder_access_list['groups'] = []

        for user_id in users:
            access_object = {
                'id': self._to_object_id(user_id),
                'level': AccessType.READ
            }
            access_list['users'].append(access_object)

            # Give read access to the project folder
            folder_access_list['users'].append(access_object)

        for group_id in groups:
            access_object = {
                'id': self._to_object_id(group_id),
                'level': AccessType.READ
            }
            access_list['groups'].append(access_object)

            # Give read access to the project folder
            folder_access_list['groups'].append(access_object)

        self.model('folder').save(project_folder)

        # TODO when we have simulation associated with a project we will have to
        # share them as well.

        return self.save(project)
