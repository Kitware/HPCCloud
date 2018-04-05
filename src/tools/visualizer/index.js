import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

// ControlPanel is also an exported component from this file, we want the default though
import ControlPanelDef from 'pvw-visualizer/src/panels/ControlPanel';
import VtkRenderer from 'paraviewweb/src/React/Renderers/VtkRenderer';
import VtkGeometryRenderer from 'paraviewweb/src/React/Renderers/VtkGeometryRenderer';
import { selectors, setVisualizerActiveStore } from 'pvw-visualizer/src/redux';
import Actions from 'pvw-visualizer/src/redux/actions';
import setup from 'pvw-visualizer/src/setup';
import ImageProviders from 'pvw-visualizer/src/ImageProviders';
import network from 'pvw-visualizer/src/network';
import LocalRenderingImageProvider from 'pvw-visualizer/src/LocalRenderingImageProvider';

import style from 'HPCCloudStyle/PageWithMenu.mcss';
import vizStyle from 'HPCCloudStyle/Visualizer.mcss';

import Toolbar from '../../panels/Toolbar';
import LoadingPanel from '../../panels/LoadingPanel';
import client from '../../network';
import { projectFunctions } from '../../utils/AccessHelper';
import { primaryBreadCrumbs } from '../../utils/Constants';

import { dispatch, store } from '../../redux';

setVisualizerActiveStore(store);

class Visualization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuVisible: true,
      isRendererBusy: false,
    };

    this.onAction = this.onAction.bind(this);
    this.nextTimeStep = this.nextTimeStep.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.previousTimeStep = this.previousTimeStep.bind(this);

    this.setImageProvider = this.setImageProvider.bind(this);
    this.resetCamera = this.resetCamera.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.localImageReady = this.localImageReady.bind(this);
    this.busyStatusUpdated = this.busyStatusUpdated.bind(this);
  }

  componentWillMount() {
    this.needsSetImageProvider = true;
  }

  componentDidMount() {
    network.onReady(() => {
      this.client = network.getClient();
      this.connection = network.getConnection();
      this.session = this.connection.getSession();

      setImmediate(() => {
        setup(network.getClient().session);
        this.setImageProvider();
        this.forceUpdate();
      });
    });

    // props.simulation is not necessarily updated with latest metadata, so we fetch it.
    client
      .getSimulationStep(this.props.simulation._id, this.props.step)
      .then((resp) => {
        const hostname = this.props.location.hostname
          ? this.props.location.hostname
          : window.location.hostname;
        const port = window.location.port;
        const config = {
          sessionURL: `ws://${hostname}:${port}/proxy?sessionId=${
            resp.data.metadata.sessionId
          }&path=ws`,
          retry: true,
        };
        network.connect(config);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.remoteRendering !== this.props.remoteRendering) {
      if (nextProps.remoteRendering) {
        // Changing back to remote rendering
        const params = this.renderer.getCameraParameters();
        this.props.updateCamera(
          this.props.viewId,
          params.focalPoint,
          params.viewUp,
          params.position
        );
      }
      ImageProviders.reset();
      this.needsSetImageProvider = true;
    }
  }

  componentDidUpdate() {
    this.setImageProvider();
  }

  componentWillUnmount() {
    // trash visualizer state here
    setImmediate(() => {
      ImageProviders.setImageProvider(null);
    });
    dispatch(Actions.resetVisualizerState());

    // Close ws without exiting server
    network.exit(-1);
  }

  onAction(name) {
    if (this[name]) {
      this[name]();
    }
  }

  setImageProvider() {
    if (this.needsSetImageProvider && this.renderer) {
      if (this.renderer.binaryImageStream) {
        ImageProviders.setImageProvider(this.renderer.binaryImageStream);
      } else {
        if (!this.localRenderingImageProvider) {
          this.localRenderingImageProvider = new LocalRenderingImageProvider();
        }
        ImageProviders.setImageProvider(this.localRenderingImageProvider);
      }
      this.needsSetImageProvider = false;
    }
  }

  toggleMenu() {
    this.setState({ menuVisible: !this.state.menuVisible });
  }

  resetCamera() {
    this.props.resetCamera();
    if (this.renderer && this.renderer.resetCamera) {
      this.renderer.resetCamera();
    }
  }

  localImageReady(img) {
    if (this.localRenderingImageProvider) {
      this.localRenderingImageProvider.fireImageReady(img);
    }
  }

  busyStatusUpdated(status) {
    this.setState({ isRendererBusy: status });
  }

  nextTimeStep() {
    const timeStep = (this.props.index + 1) % this.props.values.length;
    this.props.setTimeStep(timeStep);
  }

  togglePlay() {
    this.props[this.props.playing ? 'stopTime' : 'playTime']();
  }

  previousTimeStep() {
    const timeStep =
      (this.props.index - (1 + this.props.values.length)) %
      this.props.values.length;
    this.props.setTimeStep(timeStep);
  }

  /* eslint-disable react/jsx-no-bind */
  render() {
    if (!this.session) {
      return <LoadingPanel large center />;
    }

    const Renderer = this.props.remoteRendering
      ? VtkRenderer
      : VtkGeometryRenderer;

    const actions = [
      { name: 'toggleMenu', icon: vizStyle.toggleMenuButton },
      { name: 'nextTimeStep', icon: vizStyle.nextButton },
      {
        name: 'togglePlay',
        icon: this.props.playing ? vizStyle.stopButton : vizStyle.playButton,
      },
      { name: 'previousTimeStep', icon: vizStyle.previousButton },
      { name: 'resetCamera', icon: vizStyle.resetCameraButton },
    ];

    if (this.props.pendingCount || this.state.isRendererBusy) {
      actions.push({ name: 'busy', icon: vizStyle.busy });
    }

    return (
      <div className={style.rootContainer}>
        <Toolbar
          breadcrumb={primaryBreadCrumbs(
            this.props.project._id,
            this.props.simulation._id
          )}
          actions={actions}
          onAction={this.onAction}
          title={
            <span>
              {' '}
              <img
                alt={this.props.project.type}
                src={projectFunctions.getIcon(this.props.project).image}
                height="20px"
              />
              &nbsp;{this.props.project.name} / {this.props.simulation.name}
            </span>
          }
        />
        <ControlPanelDef
          className={
            this.state.menuVisible ? vizStyle.menu : vizStyle.hiddenMenu
          }
          resetCamera={this.resetCamera}
        />
        <Renderer
          ref={(c) => {
            this.renderer = c;
          }}
          client={this.client}
          viewId={this.props.viewId}
          connection={this.connection}
          session={this.session}
          className={vizStyle.viewport}
          onImageReady={
            this.props.provideOnImageReady ? this.localImageReady : null
          }
          viewIdUpdated={this.props.updateActiveViewId}
          onBusyChange={this.busyStatusUpdated}
          showFPS={this.props.remoteFps}
          oldImageStream={!this.props.remoteRendering}
          resizeOnWindowResize
          clearOneTimeUpdatersOnUnmount
          clearInstanceCacheOnUnmount
          interactiveQuality={this.props.interactiveQuality}
          interactiveRatio={this.props.interactiveRatio}
          throttleTime={this.props.throttleTime}
          maxFPS={this.props.maxFPS}
        />
        <div className={style.progressOverlay}>{this.props.progress}</div>
      </div>
    );
  }
}

Visualization.propTypes = {
  location: PropTypes.object,
  project: PropTypes.object,
  simulation: PropTypes.object,
  step: PropTypes.string,

  index: PropTypes.number.isRequired,
  playing: PropTypes.bool.isRequired,
  values: PropTypes.array.isRequired,
  setTimeStep: PropTypes.func.isRequired,

  resetCamera: PropTypes.func.isRequired,
  updateCamera: PropTypes.func.isRequired,
  pendingCount: PropTypes.number.isRequired,
  remoteRendering: PropTypes.bool,
  remoteFps: PropTypes.bool,
  viewId: PropTypes.string.isRequired,
  provideOnImageReady: PropTypes.bool,
  updateActiveViewId: PropTypes.func.isRequired,

  interactiveQuality: PropTypes.number.isRequired,
  interactiveRatio: PropTypes.number.isRequired,
  throttleTime: PropTypes.number.isRequired,
  maxFPS: PropTypes.number.isRequired,

  progress: PropTypes.string,
};

Visualization.defaultProps = {
  location: undefined,
  project: undefined,
  simulation: undefined,
  step: undefined,

  remoteRendering: false,
  remoteFps: false,
  provideOnImageReady: false,
  progress: '',
};

export default connect((state) => {
  const pendingCount = selectors.network.getPendingCount(state);
  const remoteRendering = selectors.view.getRemoteRenderingState(state);
  const remoteFps = selectors.view.getRemoteFpsState(state);
  const viewId = selectors.active.getActiveView(state);
  const provideOnImageReady = selectors.ui.getVisiblePanel(state) === 3; // SavePanel visible
  const interactiveQuality = selectors.view.getRemoteInteractiveQualityState(
    state
  );
  const interactiveRatio = selectors.view.getRemoteInteractiveRatioState(state);
  const throttleTime = selectors.view.getThrottleTime(state);
  const maxFPS = selectors.view.getServerMaxFPS(state);
  const progress = selectors.network.getProgressUpdate(state);

  return {
    pendingCount,
    remoteRendering,
    remoteFps,
    viewId,
    provideOnImageReady,
    interactiveRatio,
    interactiveQuality,
    throttleTime,
    maxFPS,
    progress,
    resetCamera: () => dispatch(Actions.view.resetCamera()),
    updateCamera: (vid, focalPoint, viewUp, position) =>
      dispatch(Actions.view.updateCamera(vid, focalPoint, viewUp, position)),
    updateActiveViewId: (vid) =>
      dispatch(Actions.active.activate(vid, Actions.active.TYPE_VIEW)),
    setTimeStep(index) {
      dispatch(
        Actions.time.applyTimeStep(index, state.visualizer.active.source)
      );
    },
    playTime() {
      dispatch(Actions.time.playTime());
    },
    stopTime() {
      dispatch(Actions.time.stopTime());
    },
    index: selectors.time.getTimeStep(state),
    playing: selectors.time.isAnimationPlaying(state),
    values: selectors.time.getTimeValues(state),
  };
})(Visualization);
