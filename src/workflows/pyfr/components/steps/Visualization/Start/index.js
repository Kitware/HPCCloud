import React                   from 'react';
import defaultServerParameters from '../../../../../../panels/run/defaults';
import RunClusterFrom          from '../../../../../../panels/run';
import ButtonBar               from '../../../../../../panels/ButtonBar';
import ClusterPayloads         from '../../../../../../utils/ClusterPayload';

import merge           from 'mout/src/object/merge';
import getNetworkError from '../../../../../../utils/getNetworkError';

import { connect }  from 'react-redux';
import { dispatch } from '../../../../../../redux';
import * as Actions from '../../../../../../redux/actions/taskflows';
import * as NetActions from '../../../../../../redux/actions/network';

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
    onError: React.PropTypes.func,
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
    var payload = {
      dataDir, // where the output for the sim will be
      fileName, // the file to load
      sessionKey, // for pvw, we use this later for connecting,
      output: {
        folder: {
          id: this.props.simulation.steps.Visualization.folderId,
        },
      },
    };

    if (this.state.serverType === 'Traditional') {
      payload = Object.assign(payload, this.state.Traditional.runtime || {});
      try {
        payload.cluster = ClusterPayloads.tradClusterPayload(this.state.Traditional.profile);
      } catch (error) {
        this.props.onError(error.message);
        return;
      }
    } else if (this.state.serverType === 'EC2') {
      if (!this.state.EC2.cluster) {
        try {
          payload.cluster = ClusterPayloads.ec2ClusterPayload(
            this.state.EC2.name,
            this.state.EC2.machine,
            this.state.EC2.clusterSize,
            this.state.EC2.profile
          );
        } catch (error) {
          this.props.onError(error.message);
          return;
        }
      } else {
        payload.cluster = { _id: this.state.EC2.cluster };
      }
    }

    const simStepUpdate = {
      id: this.props.simulation._id,
      name: this.props.simulation.name,
      step: 'Visualization',
      data: {
        view: 'run',
        metadata: {
          dataDir,
          fileName,
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
      serverProfiles = { EC2: this.state.EC2, Traditional: this.state.Traditional };

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
      error: getNetworkError(state, ['create_taskflow', 'start_taskflow']),
      ec2Clusters: state.preferences.aws.mapById,
      tradClusters: state.preferences.clusters.mapById,
    };
  },
  () => {
    return {
      onRun: (taskflowName, primaryJob, payload, simulationStep, location) =>
        dispatch(Actions.createTaskflow(taskflowName, primaryJob, payload, simulationStep, location)),
      onError: (message) => dispatch(NetActions.errorNetworkCall('create_taskflow', { data: { message } }, 'form')),
    };
  }
)(VisualizationStart);
