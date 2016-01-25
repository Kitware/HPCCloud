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
from girder.api.describe import Description, describeRoute
from girder.constants import AccessType
from girder.api.docs import addModel
from girder.api.rest import RestException, getBodyJson, getCurrentUser
from girder.api.rest import loadmodel
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
        self.route('POST', (':id', 'simulations'), self.create_simulation)
        self.route('GET', (':id', 'simulations'), self.simulations)
        self.route('GET', (':id',), self.get)

        self._model = self.model('project', 'hpccloud')

    addModel('ProjectProperties', schema.project, 'projects')

    @describeRoute(
        Description('Create a new project')
        .param('body', 'The properies of the project.',
               dataType='ProjectProperties', required=True, paramType='body')
    )
    @access.user
    def create(self, params):
        project = getBodyJson()
        project = self.model('project', 'hpccloud').create(getCurrentUser(),
                                                           project)

        cherrypy.response.status = 201
        cherrypy.response.headers['Location'] = '/projects/%s' % project['_id']

        return project

    @describeRoute(
        Description('Update a project')
        .param('id', 'The project to update.',
               dataType='string', required=True, paramType='path')
        .param('body', 'The properies of the project to update.',
               dataType='object', required=True, paramType='body')
    )
    @access.user
    @loadmodel(model='project', plugin='hpccloud', level=AccessType.WRITE)
    def update(self, project, params):
        immutable = ['type', 'steps', 'folderId', 'access', 'userId', '_id']
        updates = getBodyJson()

        for p in updates:
            if p in immutable:
                raise RestException('\'%s\' is an immutable property' % p, 400)

        user = getCurrentUser()
        name = updates.get('name')
        metadata = updates.get('metadata')

        self._model.update(user, project, name=name, metadata=metadata)

    @describeRoute(
        Description('Get all projects this user has access to project')
    )
    @access.user
    def get_all(self, params):
        user = getCurrentUser()
        cursor = self._model.find()

        return list(self._model.filterResultsByPermission(
            cursor=cursor, user=user, level=AccessType.READ))

    @describeRoute(
        Description('Delete a project')
        .param('id', 'The project to delete.',
               dataType='string', required=True, paramType='path')
        .notes('Will clean up any files, items or folders associated with '
               'the project.')
    )
    @access.user
    @loadmodel(model='project', plugin='hpccloud', level=AccessType.WRITE)
    def delete(self, project, params):
        user = getCurrentUser()
        self._model.delete(user, project)

    @describeRoute(
        Description('Get a particular project')
        .param('id', 'The project to get.',
               dataType='string', required=True, paramType='path')
    )
    @access.user
    @loadmodel(model='project', plugin='hpccloud', level=AccessType.READ)
    def get(self, project, params):
        return project

    addModel('ShareProperties', schema.project['definitions']['share'],
             'projects')

    @describeRoute(
        Description('Share a give project with a set of users or groups')
        .param('id', 'The project to shared.',
               dataType='string', required=True, paramType='path')
    )
    @access.user
    @loadmodel(model='project', plugin='hpccloud', level=AccessType.WRITE)
    def share(self, project, params):
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

        return self._model.share(user, project, users, groups)

    addModel('SimProperties', schema.simulation, 'projects')

    @describeRoute(
        Description('Create a simulation associated with a project.')
        .param('id', 'The project the simulation will be created in.',
               dataType='string', required=True, paramType='path')
        .param('body', 'The properties of the simulation.',
               dataType='SimProperties', required=True, paramType='body')
    )
    @access.user
    @loadmodel(model='project', plugin='hpccloud', level=AccessType.READ)
    def create_simulation(self, project, params):
        simulation = getBodyJson()
        user = getCurrentUser()

        simulation = self.model('simulation', 'hpccloud').create(
            user, project, simulation)

        cherrypy.response.status = 201
        cherrypy.response.headers['Location'] = '/simulations/%s' \
            % simulation['_id']

        return simulation

    @describeRoute(
        Description('List all the simulations associated with a project.')
        .param('id', 'The project',
               dataType='string', required=True, paramType='path')
    )
    @access.user
    @loadmodel(model='project', plugin='hpccloud', level=AccessType.READ)
    def simulations(self, project, params):
        user = getCurrentUser()

        return self.model('project', 'hpccloud').simulations(user, project)
