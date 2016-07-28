import React                   from 'react';
import ButtonBar               from '../../../../../../panels/ButtonBar';
import defaultServerParameters from '../../../../../../panels/run/defaults';
import RunClusterFrom          from '../../../../../../panels/run';
import ClusterPayloads         from '../../../../../../utils/ClusterPayload';

import merge                   from 'mout/src/object/merge';

import { connect } from 'react-redux';
import get          from 'mout/src/object/get';
import { dispatch } from '../../../../../../redux';
import * as Actions from '../../../../../../redux/actions/taskflows';

const SimulationStart = React.createClass({

  displayName: 'nwchem/common/steps/Simulation/Start',

  propTypes: {
    location: React.PropTypes.object,
    project: React.PropTypes.object,
    simulation: React.PropTypes.object,
    step: React.PropTypes.string,
    taskFlowName: React.PropTypes.string,
    primaryJob: React.PropTypes.string,
    view: React.PropTypes.string,

    error: React.PropTypes.string,
    clusters: React.PropTypes.object,
    onRun: React.PropTypes.func,
  },

  getInitialState() {
    return {
      serverType: 'Traditional',
      EC2: defaultServerParameters.EC2,
      Traditional: defaultServerParameters.Traditional,
      OpenStack: defaultServerParameters.OpenStack,

      backend: {},
      error: '',
    };
  },

  dataChange(key, value, which) {
    var profile = this.state[which];
    profile[key] = value;
    this.setState({ [which]: profile });
  },

  runSimulation() {
    const nwFile = this.props.simulation.metadata.inputFolder.files.nw || this.props.project.metadata.inputFolder.files.nw;
    var sessionId = btoa(new Float64Array(3).map(Math.random)).substring(0, 96),
      payload = {
        backend: this.state.backend,
        input: {
          folder: {
            id: this.props.simulation.metadata.inputFolder._id,
          },
          geometryFile: {
            id: this.props.simulation.metadata.inputFolder.files.geometry,
          },
          nwFile: {
            id: nwFile,
          },
        },
        output: {
          folder: {
            id: this.props.simulation.metadata.outputFolder._id,
          },
        },
      };

    if (this.state.serverType === 'Traditional') {
      payload = Object.assign(payload,
        this.state.Traditional.runtime || {},
        { cluster: ClusterPayloads.tradClusterPayload(this.state.Traditional.profile) }
      );
    } else if (this.state.serverType === 'EC2') {
      payload = Object.assign(payload,
        this.state.EC2.runtime || {}
      );
      if (!this.state.EC2.cluster) {
        payload.cluster = ClusterPayloads.ec2ClusterPayload(
          this.state.EC2.name,
          this.state.EC2.machine,
          this.state.EC2.clusterSize,
          this.state.EC2.profile
        );
      } else {
        payload.cluster = { _id: this.state.EC2.cluster };
      }
    } else {
      console.log('unrecognized serverType: ', this.state.serverType);
      return;
    }

    this.props.onRun(
      this.props.taskFlowName,
      this.props.primaryJob,
      payload,
      {
        id: this.props.simulation._id,
        name: this.props.simulation.name,
        step: 'Simulation',
        data: {
          view: 'run',
          metadata: {
            sessionId,
          },
        },
      },
      {
        pathname: this.props.location.pathname,
        query: merge(this.props.location.query, {
          view: 'run',
        }),
        state: this.props.location.state,
      });
  },

  formAction(action) {
    this[action]();
  },

  updateServerType(e) {
    this.setState({ serverType: e.target.value });
  },

  updateBackend(backend) {
    this.setState({ backend });
  },

  render() {
    var actions = [{ name: 'runSimulation', label: 'Run Simulation', icon: '' }],
      serverProfiles = { EC2: this.state.EC2, Traditional: this.state.Traditional, OpenStack: this.state.OpenStack };

    return (
      <div>
          <RunClusterFrom serverType={this.state.serverType} serverTypeChange={this.updateServerType}
            profiles={serverProfiles} dataChange={this.dataChange}
          />
          <ButtonBar
            visible={this.state[this.state.serverType].profile !== ''}
            onAction={this.formAction}
            actions={actions}
            error={ this.props.error || this.state.error }
          />
      </div>);
  },
});

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  state => {
    return {
      error: get(state, 'network.error.create_taskflow.resp.data.message')
        || get(state, 'network.error.start_taskflow.resp.data.message'),
      clusters: state.preferences.clusters.mapById,
    };
  },
  () => {
    return {
      onRun: (taskflowName, primaryJob, payload, simulationStep, location) =>
        dispatch(Actions.createTaskflow(taskflowName, primaryJob, payload, simulationStep, location)),
    };
  }
)(SimulationStart);
