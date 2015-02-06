# import to process args
import os, tempfile, requests, atexit, sys, json, io, zipfile, shutil

# import paraview modules.
from paraview.web import wamp as pv_wamp
from paraview.web import protocols as pv_protocols

# import RPC annotation
from autobahn.wamp import register as exportRpc

from paraview import simple
from vtk.web import server

try:
    import argparse
except ImportError:
    # since  Python 2.6 and earlier don't have argparse, we simply provide
    # the source for the same as _argparse and we use it instead.
    import _argparse as argparse

# =============================================================================
# Create custom Pipeline Manager class to handle clients requests
# =============================================================================

class _ResultViewer(pv_wamp.PVServerProtocol):

    itemId = None
    proxies = None
    colorPalette = None
    dataDir = None
    groupRegex = "[0-9]+\\."
    excludeRegex = "^\\.|~$|^\\$"

    @staticmethod
    def add_arguments(parser):
        parser.add_argument(
            "--token", default=None, help="The Girder token for authentication", dest="token")
        parser.add_argument(
            "--url", default=None, help="The Girder base URL", dest="url")
        parser.add_argument(
            "--itemId", default=None, help="Item ID to download data", dest="itemId")
        parser.add_argument(
            "--data-dir", default=None, help="Directory to load data from", dest="dataDir")
        parser.add_argument(
            "--proxies", default=None, help="Path to a file with json text containing filters to load", dest="proxies")


    @staticmethod
    def configure(args):
        _ResultViewer.authKey = args.authKey
        _ResultViewer.itemId = args.itemId
        _ResultViewer.dataDir = args.dataDir
        _ResultViewer.proxies = args.proxies
        _ResultViewer.url = args.url
        _ResultViewer.token = args.token

    def _check_status(self, request):
        if request.status_code != 200:
            if request.headers['Content-Type'] == 'application/json':
                print >> sys.stderr, request.json()
            request.raise_for_status()

    def initialize(self):
        self._headers = {'Girder-Token': _ResultViewer.token}

        # Make sure we have a dataDir
        if not _ResultViewer.dataDir:
            _ResultViewer.dataDir = tempfile.mkdtemp()

        # Bring used components
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebFileListing(_ResultViewer.dataDir, "Home", _ResultViewer.excludeRegex, _ResultViewer.groupRegex))
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebProxyManager(allowedProxiesFile=_ResultViewer.proxies, baseDir=_ResultViewer.dataDir, allowUnconfiguredReaders=True))
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebColorManager(pathToColorMaps=_ResultViewer.colorPalette))
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebMouseHandler())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPort())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPortImageDelivery())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPortGeometryDelivery())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebTimeHandler())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebSelectionHandler())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebWidgetManager())

        # Update authentication key to use
        self.updateSecret(_ResultViewer.authKey)

        # Download item if any
        if _ResultViewer.itemId:
            item_id = _ResultViewer.itemId
            item_files_url = '%s/item/%s/files' % (_ResultViewer.url, item_id)
            r = requests.get(item_files_url, headers=self._headers)
            self._check_status(r)

            files = r.json()

            if len(files) == 1:
                item_url = '%s/item/%s/download' % (_ResultViewer.url, item_id)
                r = requests.get(item_url, headers=self._headers)
                self._check_status(r)
                dest_path = os.path.join(_ResultViewer.dataDir, files[0]['name'])
                try:
                    os.makedirs(os.path.dirname(dest_path))
                except:
                    pass
                with open(dest_path, 'w') as fp:
                    fp.write(r.content)
            elif len(files) > 1:
                # Download the item in zip format
                item_url = '%s/item/%s/download' % (_ResultViewer.url, item_id)
                r = requests.get(item_url, headers=self._headers)
                self._check_status(r)
                files = zipfile.ZipFile(io.BytesIO(r.content))
                dest_path = os.path.join(_ResultViewer.dataDir)
                files.extractall(dest_path)

# =============================================================================
# Main: Parse args and start server
# =============================================================================

if __name__ == "__main__":
    # Create argument parser
    parser = argparse.ArgumentParser(description="Mesh Viewer")
    # Add arguments
    server.add_arguments(parser)
    _ResultViewer.add_arguments(parser)
    args = parser.parse_args()
    _ResultViewer.configure(args)

    # Start server
    server.start_webserver(options=args, protocol=_ResultViewer)
