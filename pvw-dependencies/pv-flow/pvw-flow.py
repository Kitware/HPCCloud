r"""
    This module is a ParaViewWeb server application.
    The following command line illustrates how to use it::

        $ pvpython -dr /.../pvw-flow.py --data /path/to/pfmetadata/file

        --data /.../
             Path to a pfmetadata file

    Any ParaViewWeb executable script comes with a set of standard arguments that can be overriden if need be::

        --port 8080
             Port number on which the HTTP server will listen.

        --content /path-to-web-content/
             Directory that you want to serve as static web content.
             By default, this variable is empty which means that we rely on another
             server to deliver the static content and the current process only
             focuses on the WebSocket connectivity of clients.

        --authKey vtkweb-secret
             Secret key that should be provided by the client to allow it to make
             any WebSocket communication. The client will assume if none is given
             that the server expects "vtkweb-secret" as secret key.

"""

# import to process args
import os
import sys
import argparse

# Try handle virtual env if provided
if '--virtual-env' in sys.argv:
  virtualEnvPath = sys.argv[sys.argv.index('--virtual-env') + 1]
  virtualEnv = virtualEnvPath + '/bin/activate_this.py'
  execfile(virtualEnv, dict(__file__=virtualEnv))

# import paraview modules.
from paraview.web import pv_wslink
from paraview.web import protocols as pv_protocols

# import RPC annotation
from wslink import register as exportRpc

from paraview import simple
from wslink import server

from flow import api as flow_protocols

# =============================================================================
# Create custom Pipeline Manager class to handle clients requests
# =============================================================================

class _Server(pv_wslink.PVServerProtocol):

    authKey = "wslink-secret"
    viewportScale=1.0
    viewportMaxWidth=2560
    viewportMaxHeight=1440
    settingsLODThreshold = 102400

    @staticmethod
    def add_arguments(parser):
        parser.add_argument("--data", default=os.getcwd(), help="path to the dataset file to load", dest="dataset")
        parser.add_argument("--virtual-env", default=None, help="Path to virtual environment to use")
        parser.add_argument("--viewport-scale", default=1.0, type=float, help="Viewport scaling factor", dest="viewportScale")
        parser.add_argument("--viewport-max-width", default=2560, type=int, help="Viewport maximum size in width", dest="viewportMaxWidth")
        parser.add_argument("--viewport-max-height", default=1440, type=int, help="Viewport maximum size in height", dest="viewportMaxHeight")
        parser.add_argument("--settings-lod-threshold", default=102400, type=int, help="LOD Threshold in Megabytes", dest="settingsLODThreshold")


    @staticmethod
    def configure(args):
        _Server.dataset              = args.dataset
        _Server.authKey              = args.authKey
        _Server.viewportScale        = args.viewportScale
        _Server.viewportMaxWidth     = args.viewportMaxWidth
        _Server.viewportMaxHeight    = args.viewportMaxHeight
        _Server.settingsLODThreshold = args.settingsLODThreshold


    def initialize(self):
        # Bring used components from ParaView
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebMouseHandler())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPort(_Server.viewportScale, _Server.viewportMaxWidth, _Server.viewportMaxHeight))
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebPublishImageDelivery(decode=False))

        # Bring used components from ParaView Lite
        self.registerVtkWebProtocol(flow_protocols.FlowProtocol(filepath = _Server.dataset))

        # Update authentication key to use
        self.updateSecret(_Server.authKey)

        # tell the C++ web app to use no encoding. ParaViewWebPublishImageDelivery must be set to decode=False to match.
        self.getApplication().SetImageEncoding(0);

        # ProxyManager helper
        pxm = simple.servermanager.ProxyManager()
        renderingSettings = pxm.GetProxy('settings', 'RenderViewSettings')
        renderingSettings.LODThreshold = _Server.settingsLODThreshold
        interactionProxy = pxm.GetProxy('settings', 'RenderViewInteractionSettings')
        interactionProxy.Camera3DManipulators = ['Rotate', 'Pan', 'Zoom', 'Pan', 'Roll', 'Pan', 'Zoom', 'Rotate', 'Zoom']


# =============================================================================
# Main: Parse args and start server
# =============================================================================

if __name__ == "__main__":
    # Create argument parser
    parser = argparse.ArgumentParser(description="ParaView Flow - ParaViewWeb viewer for ParFlow data")

    # Add arguments
    server.add_arguments(parser)
    _Server.add_arguments(parser)
    args = parser.parse_args()
    _Server.configure(args)

    # Start server
    server.start_webserver(options=args, protocol=_Server)
