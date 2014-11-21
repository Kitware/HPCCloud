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
