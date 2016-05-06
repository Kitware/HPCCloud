import React                   from 'react';
import defaultServerParameters from '../../../../../../panels/run/defaults';
import RunClusterFrom          from '../../../../../../panels/run';
import ButtonBar               from '../../../../../../panels/ButtonBar';
import ClusterPayloads         from '../../../../../../utils/ClusterPayload';
import RuntimeBackend          from '../../../panels/RuntimeBackend';

import merge                   from 'mout/src/object/merge';

import { connect } from 'react-redux';
import get          from 'mout/src/object/get';
import { dispatch } from '../../../../../../redux';
import * as Actions from '../../../../../../redux/actions/taskflows';

const SimulationStart = React.createClass({

  displayName: 'pyfr/common/steps/Simulation/Start',

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
    const meshFile = this.props.simulation.metadata.inputFolder.files.mesh || this.props.project.metadata.inputFolder.files.mesh;
    var clusterName,
      sessionId = btoa(new Float64Array(3).map(Math.random)).substring(0, 96),
      payload;

    if (this.state.serverType === 'Traditional') {
      clusterName = this.props.tradClusters[this.state[this.state.serverType].profile].name;
      payload = Object.assign({},
        this.state[this.state.serverType].runtime || {},
        {
          backend: this.state.backend,
          input: {
            folder: {
              id: this.props.simulation.metadata.inputFolder._id,
            },
            meshFile: {
              id: meshFile,
            },
            iniFile: {
              id: this.props.simulation.metadata.inputFolder.files.ini,
            },
          },
          output: {
            folder: {
              id: this.props.simulation.metadata.outputFolder._id,
            },
          },
          cluster: ClusterPayloads.tradClusterPayload(this.state[this.state.serverType].profile),
        });
    } else if (this.state.serverType === 'EC2') {
      payload = Object.assign({},
        this.state[this.state.serverType].runtime || {},
        {
          backend: this.state.backend,
          input: {
            folder: {
              id: this.props.simulation.metadata.inputFolder._id,
            },
            meshFile: {
              id: meshFile,
            },
            iniFile: {
              id: this.props.simulation.metadata.inputFolder.files.ini,
            },
          },
          output: {
            folder: {
              id: this.props.simulation.metadata.outputFolder._id,
            },
          },
          cluster: ClusterPayloads.ec2ClusterPayload(
            this.state[this.state.serverType].name,
            this.state[this.state.serverType].machine,
            this.state[this.state.serverType].clusterSize,
            this.state[this.state.serverType].profile
          ),
        });
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
        step: 'Simulation',
        data: {
          view: 'run',
          metadata: {
            sessionId,
            cluster: clusterName,
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
      serverProfiles = { EC2: this.state.EC2, Traditional: this.state.Traditional, OpenStack: this.state.OpenStack },
      backendProfiles = { cuda: false, openmp: [], opencl: [] };
    if (this.state.serverType === 'Traditional') {
      const clusterId = this.state.Traditional.profile;
      if (this.props.tradClusters[clusterId] && this.props.tradClusters[clusterId].config && this.props.tradClusters[clusterId].config.pyfr) {
        backendProfiles = this.props.tradClusters[clusterId].config.pyfr;
      }
    }

    return (
      <div>
          <RunClusterFrom serverType={this.state.serverType} serverTypeChange={this.updateServerType}
            profiles={serverProfiles} dataChange={this.dataChange}
          />
          <RuntimeBackend profiles={backendProfiles} onChange={ this.updateBackend } visible={this.state.serverType === 'Traditional'} />
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
)(SimulationStart);
