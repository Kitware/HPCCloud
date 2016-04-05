import React                   from 'react';

import defaultServerParameters from '../../../../../../panels/run/defaults';
import RunEC2                  from '../../../../../../panels/run/RunEC2';
import RunCluster              from '../../../../../../panels/run/RunCluster';
import RunOpenStack            from '../../../../../../panels/run/RunOpenStack';
import ButtonBar               from '../../../../../../panels/ButtonBar';
import ClusterPayloads         from '../../../../../../utils/ClusterPayload';

import merge                   from 'mout/src/object/merge';
import formStyle               from 'HPCCloudStyle/ItemEditor.mcss';

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
    const payload = {
      dataDir, // where the output for the sim will be
      fileName, // the file to load
      sessionKey, // for pvw, we use this later for connecting
    };

    if (this.state.serverType === 'Traditional') {
      payload.cluster = ClusterPayloads.tradClusterPayload(this.state[this.state.serverType].profile);
    } else if (this.state.serverType === 'EC2') {
      payload.cluster = ClusterPayloads.ec2ClusterPayload(
        this.state[this.state.serverType].profile.name,
        this.state[this.state.serverType].machine,
        this.state[this.state.serverType].clusterSize,
        this.state[this.state.serverType]._id
      );
    }

    const simStepUpdate = {
      id: this.props.simulation._id,
      step: 'Visualization',
      data: {
        view: 'run',
        metadata: {
          sessionId: sessionKey,
          dataDir,
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
      serverForm;
    switch (this.state.serverType) {
      case 'EC2':
        serverForm = <RunEC2 contents={this.state.EC2} onChange={this.dataChange} />;
        break;
      case 'Traditional':
        serverForm = <RunCluster contents={this.state.Traditional} onChange={this.dataChange} />;
        break;
      case 'OpenStack':
        serverForm = <RunOpenStack />;
        break;
      default:
        serverForm = <span>no valid serverType: {this.state.serverType}</span>;
    }
    return (
        <div>
            <section className={formStyle.group}>
                <label className={formStyle.label}>Server Type</label>
                <select className={formStyle.input} value={this.state.serverType} onChange={ this.updateServerType }>
                    <option value="Traditional">Traditional</option>
                    <option value="EC2">EC2</option>
                    <option value="OpenStack">OpenStack</option>
                </select>
            </section>
            <section>
                {serverForm}
            </section>
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
