import React            from 'react';
import Toolbar          from '../../panels/Toolbar';
import LoadingPanel     from '../../panels/LoadingPanel';
import * as network     from 'pvw-visualizer/src/network';
import ControlPanel     from 'pvw-visualizer/src/panels/ControlPanel';
import VtkRenderer      from 'paraviewweb/src/React/Renderers/VtkRenderer';
import client           from '../../network';
import { primaryBreadCrumbs } from '../../utils/Constants';

import style            from 'HPCCloudStyle/PageWithMenu.mcss';
import vizStyle         from 'HPCCloudStyle/Visualizer.mcss';

import { dispatch } from '../../redux';
import Actions from 'pvw-visualizer/src/redux/actions';

export default React.createClass({

  displayName: 'Visualization',

  propTypes: {
    location: React.PropTypes.object,
    project: React.PropTypes.object,
    simulation: React.PropTypes.object,
    step: React.PropTypes.string,
    view: React.PropTypes.string,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  getInitialState() {
    return {
      menuVisible: true,
      playing: false,
      timeStep: 0,
      timeValues: [],
    };
  },

  componentDidMount() {
    network.onReady(() => {
      this.client = network.getClient();
      this.connection = network.getConnection();
      this.session = this.connection.session;
    });

    // props.simulation is not necessarily updated with latest metadata, so we fetch it.
    client.getSimulationStep(this.props.simulation._id, this.props.step)
      .then((resp) => {
        const config = {
          sessionURL: `ws://${location.hostname}:8888/proxy?sessionId=${resp.data.metadata.sessionId}&path=ws`,
          retry: true,
        };
        network.connect(config);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  componentWillUnmount() {
    // trash visualizer state here
  },

  onAction(name) {
    this[name]();
  },

  toggleMenu() {
    this.setState({ menuVisible: !this.state.menuVisible });
  },

  resetCamera() {
    dispatch(Actions.view.resetCamera());
  },

  nextTimeStep() {
    // const timeStep = (this.state.timeStep + 1) % this.state.timeValues.length;
    // dispatch(Actions.time.applyTimeStep())
  },

  togglePlay() {
    // const playing = !this.state.playing;
    // this.setState({ playing });
    // this.proxyManager[playing ? 'playTime' : 'stopTime']();
  },

  previousTimeStep() {
    // const timeStep = (this.state.timeStep - 1 + this.state.timeValues.length) % this.state.timeValues.length;
    // this.proxyManager.setTimeStep(timeStep);
  },

  render() {
    if (!this.session) {
      return <LoadingPanel large center />;
    }

    return (
      <div className={ style.rootContainer }>
          <Toolbar
            breadcrumb={primaryBreadCrumbs(this.props.project._id, this.props.simulation._id)}
            actions={[
                { name: 'toggleMenu', icon: vizStyle.toggleMenuButton },
                { name: 'nextTimeStep', icon: vizStyle.nextButton },
                { name: 'togglePlay', icon: this.state.playing ? vizStyle.stopButton : vizStyle.playButton },
                { name: 'previousTimeStep', icon: vizStyle.previousButton },
                { name: 'resetCamera', icon: vizStyle.resetCameraButton },
            ]}
            onAction={ this.onAction }
            title={ this.props.simulation.name }
          />
          <ControlPanel className={ this.state.menuVisible ? vizStyle.menu : vizStyle.hiddenMenu } />
          <VtkRenderer className={ vizStyle.viewport }
            client={this.client}
            connection={this.connection}
            session={this.session}
          />
      </div>);
  },
});

