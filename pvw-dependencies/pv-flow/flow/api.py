from wslink import register as exportRpc
from paraview.web import protocols as pv_protocols

from paraview import simple
from flow.processing.engine import FlowEngine

# import Twisted reactor for later callback
from twisted.internet import reactor

# -----------------------------------------------------------------------------
# Protocols
# -----------------------------------------------------------------------------

class FlowProtocol(pv_protocols.ParaViewWebProtocol):

  def __init__(self, filepath = '.', **kwargs):
    super(FlowProtocol, self).__init__()
    self.playing = False
    self.flowEngine = FlowEngine(filepath)

  @exportRpc("pv.flow.state.get")
  def getState(self):
    return self.flowEngine.getState()


  @exportRpc("flow.zoom.wheel")
  def zoom(self, event):
    if 'Start' in event["type"]:
      self.getApplication().InvokeEvent('StartInteractionEvent')

    view = self.getView(event['view'])
    if view and 'spinY' in event:
      view.GetActiveCamera().Zoom(1.0 - event['spinY'] / 10.0)

    if 'End' in event["type"]:
      self.getApplication().InvokeEvent('EndInteractionEvent')


  @exportRpc("flow.reset.camera")
  def resetCamera(self, view_id):
    view = self.getView(view_id)
    simple.ResetCamera(view)
    view.CenterOfRotation = view.CameraFocalPoint
    self.getApplication().InvokeEvent('UpdateEvent')


  @exportRpc("flow.color.by")
  def colorBy(self, repId, field):
    proxy = self.mapIdToProxy(repId)
    self.flowEngine.colorBy(proxy, field)
    self.getApplication().InvokeEvent('UpdateEvent')
    return str(proxy.ColorArrayName[1])


  @exportRpc("flow.time.update")
  def updateTime(self, time):
    t = self.flowEngine.setTime(time)
    self.getApplication().InvokeEvent('UpdateEvent')
    return t


  @exportRpc("flow.subsurface.slice.update")
  def sliceSubSurface(self, sliceIdx):
    self.flowEngine.updateSubSurfaceSlice(sliceIdx)
    self.getApplication().InvokeEvent('UpdateEvent')


  @exportRpc("flow.color.mode.update")
  def updateColorMode(self, name, value):
    self.flowEngine.updateColorMode(name, value)
    self.getApplication().InvokeEvent('UpdateEvent')


  @exportRpc("flow.color.rescale")
  def rescaleColor(self, name):
    self.flowEngine.rescaleColorRange(name)
    self.getApplication().InvokeEvent('UpdateEvent')


  @exportRpc("flow.water.table.show")
  def showWaterTableDepth(self, visibility):
    self.flowEngine.showWaterTableDepth(visibility)
    self.getApplication().InvokeEvent('UpdateEvent')


  @exportRpc("flow.water.table.scale")
  def updateWaterTableDepthScaling(self, scale):
    self.flowEngine.updateWaterTableDepthScaling(scale)
    self.getApplication().InvokeEvent('UpdateEvent')


  def nextTime(self):
    if not self.playing:
      return

    currentTime = self.flowEngine.time
    newTime = self.flowEngine.goToNextTime()

    self.playing = currentTime != newTime
    if self.playing:
      self.flowEngine.render()
      reactor.callLater(0.1, lambda: self.nextTime())

    self.publish('flow.animation.state', {
      'time': newTime,
      'playing': self.playing,
    })

    if not self.playing:
      self.updateTimeAnimation(False)


  @exportRpc("flow.time.animation.set")
  def updateTimeAnimation(self, playing):
    self.playing = playing
    if playing:
      self.getApplication().InvokeEvent('StartInteractionEvent')
      self.nextTime()
    else:
      self.getApplication().InvokeEvent('EndInteractionEvent')

  @exportRpc("flow.water.balance.get")
  def getGlobalTimeWaterBalance(self):
    return self.flowEngine.getGlobalTimeWaterBalance()