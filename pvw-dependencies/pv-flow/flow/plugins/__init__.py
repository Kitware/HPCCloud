import os
from paraview import simple

# -----------------------------------------------------------------------------

MODULE_PATH = os.path.dirname(os.path.abspath(__file__))

PLUGINS = [
    'parflow.py'
]

FULL_PATHS = [
    '/Applications/ParaView-5.6.0-1626-g52acf2f741.app/Contents/Plugins/ParFlow.so',
]

# -----------------------------------------------------------------------------
# Load the plugins
# -----------------------------------------------------------------------------

for plugin in PLUGINS:
  simple.LoadPlugin(os.path.join(MODULE_PATH, plugin))

for plugin in FULL_PATHS:
  simple.LoadPlugin(plugin)
