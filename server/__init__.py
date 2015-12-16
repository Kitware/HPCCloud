#!/usr/bin/env python
# -*- coding: utf-8 -*-

###############################################################################
#  Copyright 2015 Kitware Inc.
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

import sys
from girder.models.model_base import ValidationException
from girder import events
from .proxy import Proxy

import constants

def validate_settings(event):
    key = event.info['key']

    if key == constants.PluginSettings.PROXY_FILE_PATH:
        event.preventDefault().stopPropagation()



def load(info):
    events.bind('model.setting.validate', 'pvwproxy', validate_settings)
    info['apiRoot'].proxy = Proxy()
