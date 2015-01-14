# import to process args
import os
import tempfile
import requests
import atexit
import sys

# import paraview modules.
from paraview.web import wamp as pv_wamp
from paraview.web import protocols as pv_protocols

# import RPC annotation
from autobahn.wamp import register as exportRpc

from paraview import simple
from vtk.web import server

# Needed for:
#    vtkSMPVRepresentationProxy
#    vtkSMTransferFunctionProxy
#    vtkSMTransferFunctionManager
from vtkPVServerManagerRenderingPython import *

# Needed for:
#    vtkDataObject
from vtkCommonDataModelPython import *

try:
    import argparse
except ImportError:
    # since  Python 2.6 and earlier don't have argparse, we simply provide
    # the source for the same as _argparse and we use it instead.
    import _argparse as argparse

# =============================================================================
# Create custom Pipeline Manager class to handle clients requests
# =============================================================================


class _MeshViewer(pv_wamp.PVServerProtocol):

    meshFile = None
    faces = None

    @staticmethod
    def add_arguments(parser):
        parser.add_argument(
            "--token", default=None, help="The Girder token for authentication", dest="token")
        parser.add_argument(
            "--url", default=None, help="The Girder base URL", dest="url")
        parser.add_argument(
            "--mesh", default=None, help="Exodus Mesh file id to load", dest="file")

    @staticmethod
    def configure(args):
        _MeshViewer.authKey = args.authKey
        _MeshViewer.meshFileId = args.file
        _MeshViewer.url = args.url
        _MeshViewer.token = args.token

    def initialize(self):
        # Bring used components
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebMouseHandler())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPort())
        self.registerVtkWebProtocol(
            pv_protocols.ParaViewWebViewPortImageDelivery())

        # Update authentication key to use
        self.updateSecret(_MeshViewer.authKey)

        _MeshViewer.meshFile = None
        # Process file onlu once
        if not _MeshViewer.faces:
            try:
                self.processFile()
            except:
                if _MeshViewer.meshFile:
                    os.remove(_MeshViewer.meshFile)
                raise

    def _download_mesh_file(self):
        def _cleanup():
            os.remove(_MeshViewer.meshFile)

        mesh_file = tempfile.NamedTemporaryFile(suffix='.exo', delete=False)
        _MeshViewer.meshFile = mesh_file.name
        url = '%s/file/%s/download' % (_MeshViewer.url, _MeshViewer.meshFileId)
        headers = {
            'Girder-Token': _MeshViewer.token
        }
        r = requests.get(url, headers=headers)

        if r.status_code != 200:
            print >> sys.stderr, r.json()

        r.raise_for_status()
        mesh_file.write(r.content)
        mesh_file.close()

        # register for cleanup
        atexit.register(_cleanup)

    def processFile(self):
        self._download_mesh_file()
        self.sideVisibility = []
        self.sideNames = []
        self.sideObjectValue = []

        self.reader = simple.OpenDataFile(_MeshViewer.meshFile)
        domain = self.reader.GetProperty('SideSetArrayStatus').GetDomain('array_list')
        sides = []

        for i in range(domain.GetNumberOfStrings()):
            sideName = domain.GetString(i)
            self.sideVisibility.append(True)
            self.sideObjectValue.append(int(sideName.split(': ')[1]))
            self.sideNames.append(sideName)
            sides.append(sideName)

        self.reader.SideSetArrayStatus = sides
        self.reader.ElementBlocks = []
        self.reader.UpdatePipeline()

        bounds = self.reader.GetDataInformation().GetBounds()
        box = simple.Box(XLength=(bounds[1]-bounds[0]),YLength=(bounds[3]-bounds[2]),ZLength=(bounds[5]-bounds[4]), Center=[ 0.5*(bounds[0]+bounds[1]), 0.5*(bounds[2]+bounds[3]), 0.5*(bounds[4]+bounds[5])])
        self.outline = simple.Show(box)
        self.outline.Representation = 'Outline'

        # Color/Annotation management
        annotations = []
        self.colors = []

        for i in range(domain.GetNumberOfStrings()):
            annotations.append(str(self.sideObjectValue[i]))
            annotations.append(self.sideNames[i])
            self.colors.append(0.5)
            self.colors.append(0.5)
            self.colors.append(0.5)

        # Color management
        self.lut = simple.GetColorTransferFunction('ObjectId')
        self.lut.InterpretValuesAsCategories = 1
        self.lut.Annotations = annotations
        self.lut.IndexedColors = self.colors

        mainRep = simple.Show(self.reader)
        vtkSMPVRepresentationProxy.SetScalarColoring(mainRep.SMProxy, 'ObjectId', vtkDataObject.CELL)



        self.view = simple.Render()
        self.view.Background = [0, 0, 0]

    def convertToColor(self, colorStr):
        encoding = "0123456789abcdef"
        result = []
        for colorIdx in range(3):
            value = float(encoding.index(
                colorStr[colorIdx * 2]) * 16 + encoding.index(colorStr[colorIdx * 2 + 1])) / 255.0
            result.append(value)
        return result

    @exportRpc('toggle.visibility')
    def toggleVisibility(self, index, visible):
        if index == -1:
            for i in range(len(self.sideVisibility)):
                self.sideVisibility[i] = visible

            if visible:
                self.reader.SideSetArrayStatus = self.sideNames
            else:
                self.reader.SideSetArrayStatus = []

        elif index == -2:
            self.outline.Visibility = visible
        else:
            self.sideVisibility[index] = visible
            toggleList = []
            for i in range(len(self.sideVisibility)):
                if self.sideVisibility[i]:
                    toggleList.append(self.sideNames[i])
            self.reader.SideSetArrayStatus = toggleList

    @exportRpc('toggle.color')
    def changeColor(self, index, color):
        vtkColor = self.convertToColor(color[1:])
        self.colors[index*3 + 0] = vtkColor[0]
        self.colors[index*3 + 1] = vtkColor[1]
        self.colors[index*3 + 2] = vtkColor[2]
        self.lut.IndexedColors = self.colors

    @exportRpc('extract.faces')
    def getFaceList(self):
        return self.sideNames

    @exportRpc('toggle.bg.color')
    def changeBgColor(self):
        # FIXME when we get the right face names
        bgColor = self.view.Background[0]
        bgColor = bgColor + 0.5
        if bgColor > 1.0:
            bgColor = 0
        self.view.Background = [bgColor, bgColor, bgColor]
        if bgColor == 1.0:
            self.outline.AmbientColor = [0.0,0.0,0.0]
        else:
            self.outline.AmbientColor = [1.0,1.0,1.0]

# =============================================================================
# Main: Parse args and start server
# =============================================================================

if __name__ == "__main__":
    # Create argument parser
    parser = argparse.ArgumentParser(description="Mesh Viewer")
    # Add arguments
    server.add_arguments(parser)
    _MeshViewer.add_arguments(parser)
    args = parser.parse_args()
    _MeshViewer.configure(args)

    # Start server
    server.start_webserver(options=args, protocol=_MeshViewer)
