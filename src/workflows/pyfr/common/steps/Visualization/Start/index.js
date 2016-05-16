import React                   from 'react';
import defaultServerParameters from '../../../../../../panels/run/defaults';
import RunClusterFrom          from '../../../../../../panels/run';
import ButtonBar               from '../../../../../../panels/ButtonBar';
import ClusterPayloads         from '../../../../../../utils/ClusterPayload';

import merge                   from 'mout/src/object/merge';

import { connect }  from 'react-redux';
import get          from 'mout/src/object/get';
import { dispatch } from '../../../../../../redux';
import * as Actions from '../../../../../../redux/actions/taskflows';

const VisualizationStart = React.createClass({

  displayName: 'pyfr/common/steps/Visualization/Start',

  propTypes: {
    location: React.PropTypes.object,
    project: React.PropTypes.object,
    simulation: React.PropTypes.object,
    step: React.PropTypes.string,
    taskFlowName: React.PropTypes.string,
    primaryJob: React.PropTypes.string,
    view: React.PropTypes.string,

    error: React.PropTypes.string,
    tradClusters: React.PropTypes.object,
    ec2Clusters: React.PropTypes.object,
    onRun: React.PropTypes.func,
  },

  getInitialState() {
    return {
      serverType: 'Traditional',
      EC2: defaultServerParameters.EC2,
      Traditional: defaultServerParameters.Traditional,
      OpenStack: defaultServerParameters.OpenStack,
      error: '',
    };
  },

  dataChange(key, value, which) {
    var profile = this.state[which];
    profile[key] = value;
    this.setState({ [which]: profile });
  },

  startVisualization() {
    const sessionKey = btoa(new Float64Array(3).map(Math.random)).substring(0, 96);
    const dataDir = this.props.simulation.steps.Visualization.metadata.dataDir;
    const fileName = this.props.simulation.steps.Visualization.metadata.fileName;
    var clusterId = this.state[this.state.serverType].profile;
    const payload = {
      dataDir, // where the output for the sim will be
      fileName, // the file to load
      sessionKey, // for pvw, we use this later for connecting
    };

    if (this.state.serverType === 'Traditional') {
      payload.cluster = ClusterPayloads.tradClusterPayload(this.state.Traditional.profile);
    } else if (this.state.serverType === 'EC2') {
      if (!this.state.EC2.cluster) {
        payload.cluster = ClusterPayloads.ec2ClusterPayload(
          this.state.EC2.name,
          this.state.EC2.machine,
          this.state.EC2.clusterSize,
          this.state.EC2.profile
        );
      } else {
        payload.cluster = { _id: this.state.EC2.cluster };
        clusterId = this.state.EC2.cluster;
      }
    }

    const simStepUpdate = {
      id: this.props.simulation._id,
      step: 'Visualization',
      data: {
        view: 'run',
        metadata: {
          dataDir,
          clusterId,
          sessionId: sessionKey,
        },
      },
    };
    const location = {
      pathname: this.props.location.pathname,
      query: merge(this.props.location.query, { view: 'run' }),
      state: this.props.location.state,
    };

    this.props.onRun(this.props.taskFlowName, this.props.primaryJob, payload, simStepUpdate, location);
  },

  formAction(action) {
    this[action]();
  },

  updateServerType(e) {
    this.setState({ serverType: e.target.value });
  },

  render() {
    var actions = [{ name: 'startVisualization', label: 'Start Visualization', icon: '' }],
      serverProfiles = { EC2: this.state.EC2, Traditional: this.state.Traditional, OpenStack: this.state.OpenStack };

    return (
        <div>
            <RunClusterFrom serverType={this.state.serverType} serverTypeChange={this.updateServerType}
              profiles={serverProfiles} dataChange={this.dataChange}
            />
            <section>
                <ButtonBar
                  visible={this.state[this.state.serverType].profile !== ''}
                  onAction={this.formAction}
                  actions={actions}
                  error={this.props.error}
                />
            </section>
        </div>
    );
  },
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state, props) => {
    return {
      error: get(state, 'network.error.create_taskflow.resp.data.message')
        || get(state, 'network.error.start_taskflow.resp.data.message'),
      ec2Clusters: state.preferences.aws.mapById,
      tradClusters: state.preferences.clusters.mapById,
    };
  },
  () => {
    return {
      onRun: (taskflowName, primaryJob, payload, simulationStep, location) =>
        dispatch(Actions.createTaskflow(taskflowName, primaryJob, payload, simulationStep, location)),
    };
  }
)(VisualizationStart);
