import os, time, json

import flow.plugins
from flow.configs.colorMaps import applyColorMap, applyColorMode, rescaleColor
from flow.processing.utils import histToArray

from paraview import simple, servermanager

# -----------------------------------------------------------------------------

class FlowEngine(object):

  def __init__(self, filepath = '.'):
    self.filepath = filepath
    self.time = 0.0
    self.surfaceColorMode = 0 # Local range
    self.subSurfaceColorMode = 0 # Local range

    # Surface View
    self.viewSurface = simple.CreateRenderView(True)
    self.viewSurface.EnableRenderOnInteraction = 0
    self.viewSurface.OrientationAxesVisibility = 0
    self.viewSurface.Background = [0.9, 0.9, 0.9]
    self.viewSurface.InteractionMode = '2D'
    self.viewSurface.CameraParallelProjection = 1

    # SubSurface view
    self.viewSubSurface = simple.CreateRenderView(True)
    self.viewSubSurface.EnableRenderOnInteraction = 0
    self.viewSubSurface.OrientationAxesVisibility = 0
    self.viewSubSurface.Background = [0.9, 0.9, 0.9]
    self.viewSubSurface.InteractionMode = '2D'
    self.viewSubSurface.CameraParallelProjection = 1

    # Read dataset
    self.reader = simple.ParFlowReader(FileName=filepath, DeflectTerrain=1)
    self.readerSurface = simple.OutputPort(self.reader,1)
    self.readerSubSurface = simple.OutputPort(self.reader,0)

    # Water table depth
    self.waterTableDepth = simple.WaterTableDepth(
      Subsurface=self.readerSubSurface,
      Surface=self.readerSurface
    )
    self.cellCenter = simple.CellCenters(Input=self.waterTableDepth)
    self.wtdVectCalc = simple.Calculator(Input=self.cellCenter)
    self.wtdVectCalc.ResultArrayName = 'wtdVect'
    self.wtdVectCalc.Function = 'iHat + jHat + kHat * water table depth'

    self.waterTableDepthGlyph = simple.Glyph(
      Input = self.wtdVectCalc,
      GlyphType = 'Cylinder',
      ScaleFactor = 500,
      GlyphMode = 'All Points',
      GlyphTransform = 'Transform2',
      ScaleArray = ['POINTS', 'wtdVect'],
      VectorScaleMode = 'Scale by Components',
    )
    self.waterTableDepthGlyph.GlyphTransform.Rotate = [90.0, 0.0, 0.0]
    self.waterTableDepthGlyph.GlyphType.Resolution = 12
    self.waterTableDepthGlyph.GlyphType.Radius = 0.25
    self.waterTableRepresentation = simple.Show(self.waterTableDepthGlyph, self.viewSubSurface)
    self.waterTableRepresentation.Visibility = 0

    # Water balance
    self.waterBalance = simple.WaterBalance(
      Subsurface=self.readerSubSurface,
      Surface=self.readerSurface
    )
    self.waterBalanceOverTime = simple.PlotGlobalVariablesOverTime(Input=self.waterBalance)

    # Surface representation
    self.surfaceRepresentation = simple.Show(self.readerSurface, self.viewSurface)
    self.surfaceRepresentation.SetScalarBarVisibility(self.viewSurface, True)

    # SubSurface representation + slice extract
    self.reader.UpdatePipeline()
    self.voi = self.reader.GetClientSideObject().GetOutputDataObject(0).GetExtent()
    self.extractSubset = simple.ExtractSubset(Input=self.readerSubSurface)
    self.subSurfaceRepresentation = simple.Show(self.extractSubset, self.viewSubSurface)
    self.subSurfaceRepresentation.Representation = 'Surface'

    # Reset camera + center of rotation
    simple.Render(self.viewSurface)
    simple.ResetCamera(self.viewSurface)
    self.viewSurface.CenterOfRotation = self.viewSurface.CameraFocalPoint
    simple.Render(self.viewSubSurface)
    simple.ResetCamera(self.viewSubSurface)
    self.viewSubSurface.CenterOfRotation = self.viewSubSurface.CameraFocalPoint

    # Time management
    self.animationScene = simple.GetAnimationScene()
    self.animationScene.UpdateAnimationUsingDataTimeSteps()


  def getState(self):
    return {
      'voi': self.voi,
      'time': float(self.animationScene.AnimationTime),
      'times': [float(v) for v in self.reader.TimestepValues],
      'surface': {
        'view': self.viewSurface.GetGlobalIDAsString(),
        'representation': self.surfaceRepresentation.GetGlobalIDAsString(),
        'fields': [str(v) for v in self.reader.a2DGridArrays],
        'field': str(self.surfaceRepresentation.ColorArrayName[1]),
      },
      'subsurface': {
        'view': self.viewSubSurface.GetGlobalIDAsString(),
        'representation': self.subSurfaceRepresentation.GetGlobalIDAsString(),
        'fields': [str(v) for v in self.reader.a3DGridArrays],
        'field': str(self.subSurfaceRepresentation.ColorArrayName[1]),
      },
    }

  def render(self):
    simple.Render(self.viewSurface)
    simple.Render(self.viewSubSurface)


  def colorBy(self, representation, field):
    view = self.viewSubSurface if representation == self.subSurfaceRepresentation else self.viewSurface
    representation.SetScalarBarVisibility(view, False)

    simple.ColorBy(representation, ['CELLS', field])
    applyColorMap(representation)

    representation.SetScalarBarVisibility(view, True)

    lut = simple.GetColorTransferFunction(field)
    colorBar = simple.GetScalarBar(lut, view)

    colorBar.Enabled = 1
    colorBar.Selectable = 0
    colorBar.AutoOrient = 0
    colorBar.AutomaticLabelFormat = 1
    colorBar.AddRangeLabels = 0
    colorBar.ScalarBarLength = 0.9
    colorBar.LabelColor = [0, 0, 0]
    colorBar.Position = [0.8, 0.05]
    colorBar.LockPosition = 1
    colorBar.Repositionable = 1
    colorBar.Resizable = 1
    colorBar.TitleColor = [0, 0, 0]


  def setTime(self, time):
    self.animationScene.AnimationTime = self.animationScene.TimeKeeper.Time
    self.animationScene.AnimationTime = time
    self.time = float(time)
    return self.animationScene.AnimationTime


  def updateSubSurfaceSlice(self, sliceIdx):
    newVOI = [v for v in self.extractSubset.VOI]
    newVOI[4] = sliceIdx
    newVOI[5] = sliceIdx + 1
    self.extractSubset.VOI = newVOI


  def updateColorMode(self, name, value):
    applyColorMode(name, value)


  def rescaleColorRange(self, name):
    rep = None
    if str(name) == 'surface':
      rep = self.surfaceRepresentation
    if str(name) == 'subsurface':
      rep = self.subSurfaceRepresentation

    if rep:
      rep.Input.MarkDirty(rep)
      rep.Input.UpdatePipeline(self.time)
      rescaleColor(name, rep)

  def showWaterTableDepth(self, visibility):
    if visibility:
      self.waterTableRepresentation.Visibility = 1
      self.viewSubSurface.InteractionMode = '3D'
      self.viewSubSurface.CameraParallelProjection = 0
    else:
      self.waterTableRepresentation.Visibility = 0
      self.viewSubSurface.InteractionMode = '2D'
      self.viewSubSurface.CameraParallelProjection = 1
      self.viewSubSurface.CameraFocalPoint = [0, 0, 0]
      self.viewSubSurface.CameraPosition = [0, 0, 1]
      self.viewSubSurface.CameraViewUp = [0, 1, 0]
      simple.ResetCamera(self.viewSubSurface)
      self.viewSubSurface.CenterOfRotation = self.viewSubSurface.CameraFocalPoint

  def updateWaterTableDepthScaling(self, scale):
    self.waterTableDepthGlyph.ScaleFactor = float(scale)
    self.waterTableDepthGlyph.GlyphType.Radius = 125.0 / float(scale)


  def goToNextTime(self):
    self.animationScene.GoToNext()
    self.time = self.animationScene.TimeKeeper.Time
    return self.time


  def getGlobalTimeWaterBalance(self):
    self.waterBalanceOverTime.UpdatePipeline();
    table = self.waterBalanceOverTime.GetClientSideObject().GetOutputDataObject(0)
    fields = ['subsurface storage', 'surface runoff', 'surface storage']
    result = {}
    for field in fields:
      jsonList = []
      result[field] = jsonList
      array = table.GetColumnByName(field)
      size = array.GetNumberOfTuples()
      for i in range(size):
        jsonList.append(array.GetTuple1(i))

    return result
