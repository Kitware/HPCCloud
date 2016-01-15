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

from girder.constants import AccessType
from girder.api.rest import loadmodel, getCurrentUser, Resource
from girder.api.describe import Description, describeRoute
from girder.api import access


class Simulations(Resource):

    def __init__(self):
        super(Simulations, self).__init__()
        self.resourceName = 'simulations'
        self.route('GET', (':id',), self.get)
        self.route('DELETE', (':id',), self.delete)
        self.route('PUT', (':id',), self.update)
        self.route('POST', (':id',), self.clone)
        self.route('GET', (':id', 'steps', 'stepName'), self.get_step)
        self.route('PUT', (':id', 'steps', 'stepName'), self.update_step)

        self._model = self.model('simulation', 'hpccloud')

    @describeRoute(
        Description('Get a simulation')
        .param('id', 'The simulation to get.',
               dataType='string', required=True, paramType='path')
    )
    @access.user
    @loadmodel(model='simulation', plugin='hpccloud', level=AccessType.READ)
    def get(self, simulation, params):
        return simulation

    @describeRoute(
        Description('Delete a simulation')
        .param('id', 'The simulation to delete.',
               dataType='string', required=True, paramType='path')
    )
    @access.user
    @loadmodel(model='simulation', plugin='hpccloud', level=AccessType.WRITE)
    def delete(self, simulation, params):
        user = getCurrentUser()
        self._model.delete(user, simulation)

    @loadmodel(model='simulation', plugin='hpccloud', level=AccessType.WRITE)
    def update(self, simulation, params):
        pass

    @loadmodel(model='simulation', plugin='hpccloud', level=AccessType.READ)
    def clone(self, simulation, params):
        pass

    @loadmodel(model='simulation', plugin='hpccloud', level=AccessType.READ)
    def get_step(self, simulation, params):
        pass

    @loadmodel(model='simulation', plugin='hpccloud', level=AccessType.WRITE)
    def update_step(self, simulation, params):
        pass

    @loadmodel(model='simulation', plugin='hpccloud', level=AccessType.READ)
    def download(self, simulations):
        pass
