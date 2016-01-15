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

from girder.models.model_base import AccessControlledModel, ValidationException
from girder.constants import AccessType

import schema


class Simulation(AccessControlledModel):

    def __init__(self):
        super(Simulation, self).__init__()

    def initialize(self):
        self.name = 'simulations'

    def validate(self, simulation):
        """
        Validate using jsonschema
        """
        try:
            ref_resolver = jsonschema.RefResolver.from_schema(
                schema.definitions)
            jsonschema.validate(
                simulation, schema.simulation, resolver=ref_resolver)
        except jsonschema.ValidationError as ve:
            raise ValidationException(ve.message)

        return simulation

    def create(self, user, project, simulation):
        """
        Create a simulation.

        :param user: The user creating the simulation.
        :param project: The project this simulation is associated with.
        :param simulation: The simulation object
        """
        simulation['projectId'] = project['_id']
        simulation['userId'] = user['_id']

        # Set the status of all the steps to 'created'
        for _, step in simulation['steps'].iteritems():
            step['status'] = 'created'

        # validate first, so we know we have the properties we need
        self.validate(simulation)

        project_folder = self.model('folder').load(
            project['folderId'], user=user)

        filters = {
            'name': '_simulations'
        }

        try:
            simulations_folder = self.model('folder').childFolders(
                parentType='folder', user=user, parent=project_folder,
                filters=filters, limit=1).next()
        except StopIteration:
            raise Exception('Unable to find projects simulations folder')

        simulation_folder = self.model('folder').createFolder(
            simulations_folder, simulation['name'], parentType='folder',
            creator=user)

        simulation['folderId'] = simulation_folder['_id']
        simulation = self.setUserAccess(
            simulation, user=user, level=AccessType.ADMIN)

        return self.save(simulation)
