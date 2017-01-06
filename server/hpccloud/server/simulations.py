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
from girder.utility import ziputil

from girder.constants import AccessType
from girder.api.rest import getCurrentUser, Resource
from girder.api.rest import RestException
from girder.api.describe import Description, autoDescribeRoute
from girder.api import access
from girder.api.docs import addModel

from .models import schema
from .utility import list_simulation_assets


class Simulations(Resource):

    def __init__(self):
        super(Simulations, self).__init__()
        self.resourceName = 'simulations'
        self.route('GET', (':id',), self.get)
        self.route('DELETE', (':id',), self.delete)
        self.route('PATCH', (':id',), self.update)
        self.route('POST', (':id', 'clone'), self.clone)
        self.route('GET', (':id', 'steps', ':stepName'), self.get_step)
        self.route('PATCH', (':id', 'steps', ':stepName'), self.update_step)
        self.route('GET', (':id', 'download'), self.download)

        self._model = self.model('simulation', 'hpccloud')

    @autoDescribeRoute(
        Description('Get a simulation')
        .modelParam('id', 'The simulation to get.',
                    model='simulation', plugin='hpccloud', level=AccessType.READ)
    )
    @access.user
    def get(self, simulation, params):
        return simulation

    @autoDescribeRoute(
        Description('Delete a simulation')
        .modelParam('id', 'The simulation to delete.',
                    model='simulation', plugin='hpccloud', level=AccessType.WRITE)
    )
    @access.user
    def delete(self, simulation, params):
        user = getCurrentUser()
        self._model.delete(user, simulation)

    addModel('Steps', schema.simulation['properties']['steps'], 'simulations')
    addModel('UpdateProperties', {
        'id': 'UpdateProperties',
        'properties': {
            'name': {
                'type': 'string',
                'description': 'The simulation name.'
            },
            'description': {
                'type': 'string',
                'description': 'The description of the simulation.'
            },
            'active': {
                'type': 'string',
                'items': {
                    'type': 'string'
                },
                'description': 'The name of the active step.'
            },
            'disabled': {
                'type': 'array',
                'items': {
                    'type': 'string'
                },
                'description': 'List of disabled steps.'
            },
        }
    }, 'simulations')

    @autoDescribeRoute(
        Description('Update a simulation')
        .modelParam('id', 'The simulation to update.',
                    model='simulation', plugin='hpccloud', level=AccessType.WRITE)
        .jsonParam('updates', 'The properies of the simulation to update.',
                   dataType='UpdateProperties', required=True, paramType='body')
    )
    @access.user
    def update(self, simulation, updates, params):
        immutable = ['projectId', 'folderId', 'access', 'userId', '_id',
                     'updated', 'created']

        for p in updates:
            if p in immutable:
                raise RestException('\'%s\' is an immutable property' % p, 400)

        user = getCurrentUser()
        name = updates.get('name')
        description = updates.get('description')
        active = updates.get('active')
        disabled = updates.get('disabled')
        status = updates.get('status')
        metadata = updates.get('metadata')
        steps = updates.get('steps')

        return self._model.update(user, simulation, name=name,
                                  metadata=metadata, description=description,
                                  active=active, disabled=disabled,
                                  status=status, steps=steps)

    addModel('CloneParams', {
        'id': 'CloneParams',
        'properties': {
            'name': {
                'type': 'string',
                'description': 'The new name for the simulation'
            }
        }
    }, 'simulations')

    @autoDescribeRoute(
        Description('Clone a simulation')
        .modelParam('id', 'The simulation to clone.',
                    model='simulation', plugin='hpccloud', level=AccessType.READ)
        .jsonParam('props', 'The properies of the simulation to update.',
                   dataType='CloneParams', required=True, paramType='body')
    )
    @access.user
    def clone(self, simulation, props, params):
        self.requireParams(('name', ), props)
        user = getCurrentUser()

        cloned = self._model.clone(user, simulation, props['name'])

        cherrypy.response.status = 201
        cherrypy.response.headers['Location'] = '/simulations/%s' \
            % cloned['_id']

        return cloned

    @autoDescribeRoute(
        Description('Get a particular step in a simulation')
        .modelParam('id', 'The simulation containing the step.',
                    model='simulation', plugin='hpccloud', level=AccessType.READ)
        .param('stepName', 'The step name to gets.',
               dataType='string', required=True, paramType='path')
    )
    @access.user
    def get_step(self, simulation, stepName, params):
        if stepName not in simulation.get('steps', {}):
            raise RestException('Simulation %s doesn\'t contain step %s' %
                                (simulation['_id'], stepName), 400)

        return simulation.get('steps', {}).get(stepName)

    addModel('Step', schema.definitions['stepUpdate'], 'simulations')

    @autoDescribeRoute(
        Description('Update a particular step in a simulation')
        .modelParam('id', 'The simulation containing the step.',
                    model='simulation', plugin='hpccloud', level=AccessType.WRITE)
        .param('stepName', 'The step name to gets.',
               dataType='string', required=True, paramType='path')
        .jsonParam('updates', 'The properies of the step to update.',
                   dataType='Step', required=True, paramType='body')
    )
    @access.user
    def update_step(self, simulation, stepName, updates, params):
        user = getCurrentUser()
        immutable = ['type', 'folderId']

        if stepName not in simulation.get('steps', {}):
            raise RestException('Simulation %s doesn\'t contain step %s' %
                                (simulation['_id'], stepName), 400)

        for p in updates:
            if p in immutable:
                raise RestException('\'%s\' is an immutable property' % p, 400)

        try:
            ref_resolver = jsonschema.RefResolver.from_schema(
                schema.definitions)
            jsonschema.validate(
                updates, schema.definitions['stepUpdate'],
                resolver=ref_resolver)
        except jsonschema.ValidationError as ve:
            raise RestException(ve.message, 400)

        status = updates.get('status')
        metadata = updates.get('metadata')
        export = updates.get('export')
        view = updates.get('view')

        return self._model.update_step(
            user, simulation, stepName, status, metadata, export, view)

    @autoDescribeRoute(
        Description('Download all the asset associated with a simulation')
        .modelParam('id', 'The simulation to download.',
                    model='simulation', plugin='hpccloud', level=AccessType.READ)
    )
    @access.user
    def download(self, simulation, params):
        user = self.getCurrentUser()
        cherrypy.response.headers['Content-Type'] = 'application/zip'
        cherrypy.response.headers['Content-Disposition'] = \
            u'attachment; filename="{}{}"'.format(simulation['name'], '.zip')

        def stream():
            zip = ziputil.ZipGenerator()
            for (path, file) in list_simulation_assets(user, simulation):
                for data in zip.addFile(file, path):
                    yield data
            yield zip.footer()

        return stream

    @autoDescribeRoute(
        Description('Set particular step in the simulation as the active step')
        .modelParam('id', 'The simulation id.',
                    model='simulation', plugin='hpccloud', level=AccessType.WRITE)
        .param('stepName', 'The simulation step name.',
               dataType='string', required=True, paramType='path')
    )
    @access.user
    def set_active(self, simulation, stepName, params):

        if stepName not in simulation.get('steps', {}):
            raise RestException('Invalid step name', 400)

        simulation['active'] = stepName

        return self._model.save(simulation)
