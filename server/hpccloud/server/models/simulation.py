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

import datetime

import jsonschema
import six

from girder.models.model_base import AccessControlledModel, ValidationException
from girder.constants import AccessType

from ..utility import share_folder, to_object_id, get_simulations_folder
from . import schema


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

        if 'active' in simulation and \
                simulation['active'] not in simulation.get('steps', {}):
            raise ValidationException('Invalid step name', 'active')

        if 'disabled' in simulation:
            steps = simulation.get('steps', {})
            for step in simulation['disabled']:
                if step not in steps:
                    raise ValidationException('Invalid step name \'%s\'.' %
                                              step, 'disabled')

        # Ensure unique name for the simulation within the project
        q = {
            'name': simulation['name'],
            'projectId': simulation['projectId']
        }

        if '_id' in simulation:
            q['_id'] = {'$ne': simulation['_id']}

        duplicate = self.findOne(q, fields=['_id'])
        if duplicate is not None:
            raise ValidationException('A simulation with that name already '
                                      'exists in this project.', 'name')

        return simulation

    def create(self, user, project, simulation, create_step_folders=True):
        """
        Create a simulation.

        :param user: The user creating the simulation.
        :param project: The project this simulation is associated with.
        :param simulation: The simulation object
        """
        simulation['projectId'] = project['_id']
        simulation['userId'] = user['_id']
        now = datetime.datetime.utcnow()
        simulation['created'] = now
        simulation['updated'] = now

        # validate first, so we know we have the properties we need
        self.validate(simulation)

        simulations_folder = get_simulations_folder(user, project)

        simulation_folder = self.model('folder').createFolder(
            simulations_folder, simulation['name'], parentType='folder',
            creator=user)

        simulation['folderId'] = simulation_folder['_id']
        # Set the status of all the steps to 'created' and create the folders
        # for each step
        for name, step in six.iteritems(simulation['steps']):
            step['status'] = 'created'
            if create_step_folders:
                step_folder = self.model('folder').createFolder(
                    simulation_folder, name, parentType='folder',
                    creator=user)
                step['folderId'] = step_folder['_id']

        # We should share with the same users and groups associated with the
        # project
        users = [user_access for user_access in project['access']['users']
                 if user_access['id'] != user['_id']]
        groups = project['access']['groups']

        # Give admin access to creator
        simulation = self.setUserAccess(
            simulation, user=user, level=AccessType.ADMIN, save=False)

        simulation['access']['users'] += users
        simulation['access']['groups'] += groups

        # Share the simulation folder
        simulation_folder = self.model('folder').load(
            simulation['folderId'], user=user)
        simulation_folder['access']['users'] += users
        simulation_folder['access']['groups'] += groups
        self.model('folder').setAccessList(
            simulation_folder, simulation_folder['access'], save=True,
            recurse=True, user=user)

        return self.save(simulation)

    def delete(self, user, simulation):
        """
        Delete a simulation.

        :param user: The user deleting the simulation.
        :param simulation: The simulation to be deleted
        """

        # Load the simulation folder
        simulation_folder = self.model('folder').load(
            simulation['folderId'], user=user)

        self.remove(simulation)
        self.model('folder').remove(simulation_folder)

    def update_simulation(self, user, simulation, name, metadata=None,
                          description=None, active=None, disabled=None,
                          status=None, steps=None):
        """
        Update a simulation.

        :param user: The user updating the simulation.
        :param simulation: The simulation to be deleted
        :param name: The new simulation name
        """
        dirty = False
        if name:
            dirty = True
            simulation['name'] = name

        if description:
            dirty = True
            simulation['description'] = description

        if active:
            dirty = True
            simulation['active'] = active

        if disabled is not None:
            dirty = True
            simulation['disabled'] = disabled

        if status:
            dirty = True
            simulation['status'] = status

        if metadata:
            dirty = True
            simulation['metadata'] = metadata

        if steps:
            dirty = True
            simulation['steps'] = steps

        if dirty:
            simulation['updated'] = datetime.datetime.utcnow()
            simulation = self.save(simulation)

        return simulation

    def clone(self, user, simulation, name):
        """
        Clone a simulation. Copied over input steps, but rest output steps. To
        'created'.

        :param user: The user cloning the simulation.
        :param simulation: The simulation to be clone
        :param name: The cloned simulation name
        """
        project = self.model('project', 'hpccloud').load(
            simulation['projectId'], user=user, level=AccessType.READ)

        del simulation['_id']
        simulation['name'] = name

        cloned_simulation = self.create(
            user, project, simulation, create_step_folders=False)
        simulation_folder = self.model('folder').load(
            cloned_simulation['folderId'], user=user, level=AccessType.READ)

        for name, step in six.iteritems(cloned_simulation['steps']):
            if step['type'] == 'input':
                step_folder = self.model('folder').load(
                    step['folderId'], user=user, level=AccessType.READ)
                copied_folder = self.model('folder').copyFolder(
                    step_folder, parent=simulation_folder, name=name,
                    parentType='folder', creator=user)
                step['folderId'] = copied_folder['_id']
                step['status'] = simulation['steps'][name]['status']
            elif step['type'] == 'output':
                # Just create a new folder
                created_folder = self.model('folder').createFolder(
                    simulation_folder, name, parentType='folder', creator=user)
                step['folderId'] = created_folder['_id']
                if 'metatdata' in step:
                    del step['metadata']

        cloned_simulations = self.save(cloned_simulation)

        return cloned_simulations

    def share(self, sharer, simulation, users, groups):
        """
        Share a simulation.

        :param user: The user sharing the simulation.
        :param simulation: The simulation to be shared
        :param users: The users to share with.
        :param groups: The groups to share with.
        """
        access_list = simulation.get('access', {})
        access_list['users'] = [user for user in access_list.get('users', [])
                                if user != sharer['_id']]
        access_list['groups'] = []

        for user_id in users:
            access_object = {
                'id': to_object_id(user_id),
                'level': AccessType.READ
            }
            access_list['users'].append(access_object)

        for group_id in groups:
            access_object = {
                'id': to_object_id(group_id),
                'level': AccessType.READ
            }
            access_list['groups'].append(access_object)

        # Share the simulation folder
        simulation_folder = self.model('folder').load(
            simulation['folderId'], user=sharer)

        share_folder(sharer, simulation_folder, users, groups)

        return self.save(simulation)

    def update_step(self, user, simulation, step_name, status, metadata,
                    export, view):
        """
        Update a simulation step.

        :param user: The user updating the simulation.
        :param simulation: The simulation to be updated.
        :param step_name: The name of the step to be updated.
        :param status: The new status.
        :param metadata: The new metadata object.
        :param export: The new export object.
        """
        step = simulation['steps'][step_name]
        dirty = False
        if status is not None:
            step['status'] = status
            dirty = True

        if metadata is not None:
            step['metadata'] = metadata
            dirty = True

        if export is not None:
            step['export'] = export
            dirty = True

        if view is not None:
            step['view'] = view
            dirty = True

        if dirty:
            simulation['updated'] = datetime.datetime.utcnow()
            simulation = self.save(simulation)

        return simulation
