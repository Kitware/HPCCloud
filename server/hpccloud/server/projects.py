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

import cherrypy

import jsonschema

from girder.api import access
from girder.api.describe import Description, autoDescribeRoute
from girder.constants import AccessType
from girder.api.docs import addModel
from girder.api.rest import RestException, getCurrentUser
from girder.api.rest import Resource

from .models import schema


class Projects(Resource):

    def __init__(self):
        super(Projects, self).__init__()
        self.resourceName = 'projects'
        self.route('POST', (), self.create)
        self.route('PATCH', (':id', ), self.update)
        self.route('GET', (), self.get_all)
        self.route('DELETE', (':id', ), self.delete)
        self.route('PUT', (':id', 'share'), self.share)
        self.route('PUT', (':id', 'unshare'), self.unshare)
        self.route('POST', (':id', 'simulations'), self.create_simulation)
        self.route('GET', (':id', 'simulations'), self.simulations)
        self.route('GET', (':id',), self.get)

        self._model = self.model('project', 'hpccloud')

    addModel('ProjectProperties', schema.project, 'projects')

    @autoDescribeRoute(
        Description('Create a new project')
        .jsonParam('project', 'The properies of the project.',
                   dataType='ProjectProperties', required=True,
                   paramType='body')
    )
    @access.user
    def create(self, project, params):
        project = self.model('project', 'hpccloud').create(getCurrentUser(),
                                                           project)

        cherrypy.response.status = 201
        cherrypy.response.headers['Location'] = '/projects/%s' % project['_id']

        return project

    @autoDescribeRoute(
        Description('Update a project')
        .modelParam('id', 'The project to update.', model='project',
                    plugin='hpccloud', level=AccessType.WRITE)
        .jsonParam('updates', 'The properties of the project to update.',
                   required=True, paramType='body')
    )
    @access.user
    def update(self, project, updates, params):
        immutable = ['type', 'steps', 'folderId', 'access', 'userId', '_id',
                     'created', 'updated']

        for p in updates:
            if p in immutable:
                raise RestException('\'%s\' is an immutable property' % p, 400)

        user = getCurrentUser()
        name = updates.get('name')
        metadata = updates.get('metadata')
        description = updates.get('description')

        return self._model.update_project(user, project, name=name,
                                          metadata=metadata,
                                          description=description)

    @autoDescribeRoute(
        Description('Get all projects this user has access to project')
        .pagingParams(defaultSort='created')
    )
    @access.user
    def get_all(self, limit, offset, sort, params):
        user = getCurrentUser()

        cursor = self._model.find(limit=limit, offset=offset, sort=sort)
        return list(self._model.filterResultsByPermission(cursor=cursor,
                    user=user, level=AccessType.READ))

    @autoDescribeRoute(
        Description('Delete a project')
        .modelParam('id', 'The project to delete.',
                    model='project', plugin='hpccloud', level=AccessType.WRITE)
        .notes('Will clean up any files, items or folders associated with '
               'the project.')
    )
    @access.user
    def delete(self, project, params):
        user = getCurrentUser()
        self._model.delete(user, project)

    @autoDescribeRoute(
        Description('Get a particular project')
        .modelParam('id', 'The project to get.',
                    model='project', plugin='hpccloud', level=AccessType.READ)
    )
    @access.user
    def get(self, project, params):
        return project

    addModel('ShareProperties', schema.project['definitions']['share'],
             'projects')

    @autoDescribeRoute(
        Description('Share a give project with a set of users or groups')
        .modelParam('id', 'The project to shared.',
                    model='project', plugin='hpccloud', level=AccessType.WRITE)
        .jsonParam('share', 'The users and groups to share with.',
                   dataType='SimProperties', required=True, paramType='body')
    )
    @access.user
    def share(self, project, share, params):
        user = getCurrentUser()

        # Validate we have been given a value body
        try:
            ref_resolver = jsonschema.RefResolver.from_schema(
                schema.definitions)
            jsonschema.validate(share, schema.project['definitions']['share'],
                                resolver=ref_resolver)
        except jsonschema.ValidationError as ve:
            raise RestException(ve.message, 400)

        users = share.get('users', [])
        groups = share.get('groups', [])

        return self._model.share(user, project, users, groups)

    @describeRoute(
        Description('Share a give project with a set of users or groups')
        .param('id', 'The project to shared.',
               dataType='string', required=True, paramType='path')
        .param('body', 'Array of users to share the project with.',
               dataType='object', required=True, paramType='body')
    )
    @access.user
    @loadmodel(model='project', plugin='hpccloud', level=AccessType.WRITE)
    def unshare(self, project, params):
        body = getBodyJson()
        user = getCurrentUser()

        # Validate we have been given a value body
        try:
            ref_resolver = jsonschema.RefResolver.from_schema(
                schema.definitions)
            jsonschema.validate(body, schema.project['definitions']['share'],
                                resolver=ref_resolver)
        except jsonschema.ValidationError as ve:
            raise RestException(ve.message, 400)

        users = body.get('users', [])
        groups = body.get('groups', [])

        return self._model.unshare(user, project, users, groups)

    addModel('SimProperties', schema.simulation, 'projects')

    @autoDescribeRoute(
        Description('Create a simulation associated with a project.')
        .modelParam('id', 'The project the simulation will be created in.',
                    model='project', plugin='hpccloud', level=AccessType.READ)
        .jsonParam('simulation', 'The properties of the simulation.',
                   dataType='SimProperties', required=True, paramType='body')
    )
    @access.user
    def create_simulation(self, project, simulation, params):
        user = getCurrentUser()

        simulation = self.model('simulation', 'hpccloud').create(
            user, project, simulation)

        cherrypy.response.status = 201
        cherrypy.response.headers['Location'] = '/simulations/%s' \
            % simulation['_id']

        return simulation

    @autoDescribeRoute(
        Description('List all the simulations associated with a project.')
        .modelParam('id', 'The project',
                    model='project', plugin='hpccloud', level=AccessType.READ)
        .pagingParams(defaultSort='created')
    )
    @access.user
    def simulations(self, project, limit, offset, sort, params):
        user = getCurrentUser()
        return self.model('project', 'hpccloud').simulations(user, project,
                                                             limit, offset)
