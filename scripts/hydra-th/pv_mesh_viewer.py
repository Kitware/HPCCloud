# import to process args
import os
import tempfile
import atexit
import sys
import re
import requests

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

    fileId = None
    itemId = None
    faces = None

    @staticmethod
    def add_arguments(parser):
        parser.add_argument(
            "--token", default=None, help="The Girder token for authentication", dest="token")
        parser.add_argument(
            "--url", default=None, help="The Girder base URL", dest="url")
        parser.add_argument(
            "--file", default=None, help="Exodus Mesh file id to load", dest="file")
        parser.add_argument(
            "--item", default=None, help="Item that contains the Exodus Mesh", dest="item")

    @staticmethod
    def configure(args):
        _MeshViewer.authKey = args.authKey
        _MeshViewer.fileId= args.file
        _MeshViewer.itemId = args.item
        _MeshViewer.url = args.url
        _MeshViewer.token = args.token

        print args

    def initialize(self):
        # Bring used components
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebMouseHandler())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPort())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPortImageDelivery())

        # Update authentication key to use
        self.updateSecret(_MeshViewer.authKey)

        # Process file only once
        if not _MeshViewer.faces:
            try:
                self.processFile()
            except Exception as inst:
                print "Caught exception processing file:"
                print inst

    def _download_mesh_file(self):
        def _cleanup():
            os.remove(_MeshViewer.fileName)

        mesh_file = tempfile.NamedTemporaryFile(suffix='.exo', delete=False)
        _MeshViewer.fileName = mesh_file.name
        url = '%s/file/%s/download' % (_MeshViewer.url, _MeshViewer.fileId)
        print "Download", url
        print "Token", _MeshViewer.token
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

    def extractSubset(self, propName):
        domain = self.reader.GetProperty(propName).GetDomain('array_list')
        regex = re.compile('ID:\s+(\d+)')

        subElementNames = []
        subElementValues = []

        for i in range(domain.GetNumberOfStrings()):
            elementName = domain.GetString(i)
            elementValue = -1

            m = regex.search(elementName)
            if m:
                elementValue = int(m.group(1))
            else:
                print 'ERROR: ' + elementName + ' could be parsed to get id'

            subElementNames.append(elementName)
            subElementValues.append(elementValue)

        return subElementNames, subElementValues

    def processFile(self):
        self._download_mesh_file()
        self.sideVisibility = []
        self.sideNames = []
        self.sideObjectValue = []

        self.blockVisibility = []
        self.blockNames = []
        self.blockObjectValue = []

        self.reader = simple.OpenDataFile(_MeshViewer.fileName)

        # Get information about faces and blocks
        self.sideNames, self.sideValues = self.extractSubset('SideSetArrayStatus')
        self.blockNames, self.blockValues = self.extractSubset('ElementBlocks')

        # Show faces to start
        self.reader.SideSetArrayStatus = self.sideNames
        self.reader.ElementBlocks = []
        self.reader.UpdatePipeline()

        # Set up initial visibilities
        self.sideVisibility = [ True for i in xrange(len(self.sideNames)) ]
        self.blockVisibility = [ True for i in xrange(len(self.blockNames)) ]
        self.showingFaces = True

        bounds = self.reader.GetDataInformation().GetBounds()
        box = simple.Box(XLength=(bounds[1]-bounds[0]),YLength=(bounds[3]-bounds[2]),ZLength=(bounds[5]-bounds[4]), Center=[ 0.5*(bounds[0]+bounds[1]), 0.5*(bounds[2]+bounds[3]), 0.5*(bounds[4]+bounds[5])])
        self.outline = simple.Show(box)
        self.outline.Representation = 'Outline'

        # Color/Annotation management
        self.faceAnnotations, self.faceColors = self.setupInitialColors(self.sideNames, self.sideValues)
        self.blockAnnotations, self.blockColors = self.setupInitialColors(self.blockNames, self.blockValues)

        # Color management, start with faces
        self.lut = simple.GetColorTransferFunction('ObjectId')
        self.lut.InterpretValuesAsCategories = 1
        self.lut.Annotations = self.faceAnnotations
        self.lut.IndexedColors = self.faceColors

        mainRep = simple.Show(self.reader)
        vtkSMPVRepresentationProxy.SetScalarColoring(mainRep.SMProxy, 'ObjectId', vtkDataObject.CELL)

        self.view = simple.Render()
        self.view.Background = [0, 0, 0]

    def setupInitialColors(self, elementNames, elementValues):
        annotations = []
        colors = []
        for i in range(len(elementNames)):
            annotations.append(str(elementValues[i]))
            annotations.append(elementNames[i])
            colors.append(0.5)
            colors.append(0.5)
            colors.append(0.5)
        return annotations, colors

    def convertToColor(self, colorStr):
        encoding = "0123456789abcdef"
        result = []
        for colorIdx in range(3):
            value = float(encoding.index(
                colorStr[colorIdx * 2]) * 16 + encoding.index(colorStr[colorIdx * 2 + 1])) / 255.0
            result.append(value)
        return result

    def setReaderElements(self, visibilities, names, targetProperty):
        toggleList = []

        for i in range(len(visibilities)):
            if visibilities[i]:
                toggleList.append(names[i])

        self.reader.GetProperty(targetProperty).SetData(toggleList)

    def updateElementColors(self):
        if self.showingFaces:
            self.lut.Annotations = self.faceAnnotations
            self.lut.IndexedColors = self.faceColors
        else:
            self.lut.Annotations = self.blockAnnotations
            self.lut.IndexedColors = self.blockColors

    @exportRpc('set.showing.elements')
    def setShowingElements(self, faces):
        self.showingFaces = faces

        if self.showingFaces:
            visibilities = self.sideVisibility
            names = self.sideNames
            targetProp = 'SideSetArrayStatus'
            self.reader.ElementBlocks = []
        else:
            visibilities = self.blockVisibility
            names = self.blockNames
            targetProp = 'ElementBlocks'
            self.reader.SideSetArrayStatus = []

        self.setReaderElements(visibilities, names, targetProp)
        self.updateElementColors()

    @exportRpc('toggle.visibility')
    def toggleVisibility(self, index, visible):
        if self.showingFaces:
            visibilities = self.sideVisibility
            names = self.sideNames
            activePropName = 'SideSetArrayStatus'
        else:
            visibilities = self.blockVisibility
            names = self.blockNames
            activePropName = 'ElementBlocks'

        if index == -1:
            self.outline.Visibility = visible
        elif index == -2:
            for i in range(len(visibilities)):
                visibilities[i] = visible

            if visible:
                self.reader.GetProperty(activePropName).SetData(names)
            else:
                self.reader.GetProperty(activePropName).SetData([])
        else:
            visibilities[index] = visible
            self.setReaderElements(visibilities, names, activePropName)

    @exportRpc('toggle.color')
    def changeColor(self, facesOrBlocks, index, color, updateLut):
        vtkColor = self.convertToColor(color[1:])

        if facesOrBlocks == 'faces':
            colors = self.faceColors
        else:
            colors = self.blockColors

        colors[index*3 + 0] = vtkColor[0]
        colors[index*3 + 1] = vtkColor[1]
        colors[index*3 + 2] = vtkColor[2]

        if updateLut:
            self.lut.IndexedColors = colors

    @exportRpc('extract.subsets')
    def getSubElementsList(self):
        faces = []

        for i in xrange(len(self.sideNames)):
            faces.append({
                'name': self.sideNames[i],
                'id': self.sideValues[i],
                'visible': True
            })

        blocks = []

        for i in xrange(len(self.blockNames)):
            blocks.append({
                'name': self.blockNames[i],
                'id': self.blockValues[i],
                'visible': True
            })

        return { 'faces': faces, 'blocks': blocks }

    @exportRpc('toggle.bg.color')
    def changeBgColor(self):
        # FIXME when we get the right face names
        bgColor = self.view.Background[0]
        bgColor = bgColor + 0.5
        if bgColor > 1.0:
            bgColor = 0
        bgPropertyValue = [bgColor, bgColor, bgColor]
        self.view.Background = bgPropertyValue
        if bgColor == 1.0:
            self.outline.AmbientColor = [0.0,0.0,0.0]
        else:
            self.outline.AmbientColor = [1.0,1.0,1.0]

        return bgPropertyValue

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
