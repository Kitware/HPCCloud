import sys

from .proxy import Proxy

def load(info):
    info['apiRoot'].proxy = Proxy()
