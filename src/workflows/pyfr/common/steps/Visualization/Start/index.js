import React                   from 'react';

import defaultServerParameters from '../../../../../../panels/run/defaults';
import RunEC2                  from '../../../../../../panels/run/RunEC2';
import RunCluster              from '../../../../../../panels/run/RunCluster';
import RunOpenStack            from '../../../../../../panels/run/RunOpenStack';
import ButtonBar               from '../../../../../../panels/ButtonBar';

import client                  from '../../../../../../network';
import deepClone               from 'mout/src/lang/deepClone';
import merge                   from 'mout/src/object/merge';
import formStyle               from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({

  displayName: 'pyfr/common/steps/Visualization/Start',

  propTypes: {
    location: React.PropTypes.object,
    project: React.PropTypes.object,
    simulation: React.PropTypes.object,
    step: React.PropTypes.string,
    taskFlowName: React.PropTypes.string,
    view: React.PropTypes.string,
  },

  contextTypes: {
    router: React.PropTypes.object,
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

  setServerType(e) {
    this.setState({ serverType: e.target.value });
  },

  dataChange(key, value, which) {
    var profile = this.state[which];
    profile[key] = value;
    this.setState({ [which]: profile });
  },

  startVisualization() {
    var taskflowId,
      sessionId = btoa(new Float64Array(3).map(Math.random)).substring(0, 96),
      dataDir = this.props.simulation.steps.Visualization.metadata.dataDir,
      metadata = { taskflowId, sessionId, dataDir };
    client.createTaskflow(this.props.taskFlowName)
      .then((resp) => {
        taskflowId = resp.data._id;
        return client.startTaskflow(taskflowId, {
          cluster: { _id: this.state[this.state.serverType].profile },
          dataDir, // where the output for the sim will be
          sessionKey: sessionId, // for pvw, we use this later for connecting
        });
      })
      .then((resp) =>
        client.updateSimulationStep(this.props.simulation._id, this.props.step, {
          view: 'run',
          metadata,
        })
      )
      .then((resp) => {
        var newSim = deepClone(this.props.simulation);
        newSim.steps[this.props.step].view = 'run';
        newSim.steps[this.props.step].metadata = metadata;
        client.invalidateSimulation(newSim);

        this.context.router.replace({
          pathname: this.props.location.pathname,
          query: merge(this.props.location.query, { view: 'run' }),
          state: this.props.location.state,
        });
      })
      .catch((error) => {
        var msg = error.data && error.data.message ? error.data.message : error;
        this.setState({ error: msg });
      });
  },

  formAction(action) {
    this[action]();
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
                <select className={formStyle.input} value={this.state.serverType} onChange={ this.setServerType }>
                    <option value="Traditional">Traditional</option>
                    <option value="EC2">EC2</option>
                    <option value="OpenStack">OpenStack</option>
                </select>
            </section>
            <section>
                {serverForm}
            </section>
            <section className={formStyle.buttonGroup}>
                <ButtonBar
                  visible={this.state[this.state.serverType].profile !== ''}
                  onAction={this.formAction}
                  actions={actions}
                  error={this.state.error}
                />
            </section>
        </div>
    );
  },
});
