import React                   from 'react';

import defaultServerParameters from '../../../../../../panels/run/defaults';
import RunEC2                  from '../../../../../../panels/run/RunEC2';
import RunCluster              from '../../../../../../panels/run/RunCluster';
import RunOpenStack            from '../../../../../../panels/run/RunOpenStack';
import ButtonBar               from '../../../../../../panels/ButtonBar';

import client                  from '../../../../../../network';
import formStyle               from 'HPCCloudStyle/ItemEditor.mcss';
import merge                   from 'mout/src/object/merge';
import deepClone               from 'mout/src/lang/deepClone';

export default React.createClass({
  displayName: 'pvw/start-visualization',
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
  componentWillMount() {

  },
  dataChange(key, value, server) {
    var profile = this.state[server];
    profile[key] = value;
    this.setState({ [server]: profile });
  },
  startVisualization() {
    var taskflowId,
      sessionId = btoa(new Float64Array(3).map(Math.random)).substring(0, 96);
    client.createTaskflow(this.props.taskFlowName)
      .then((resp) => {
        taskflowId = resp.data._id;
        return client.startTaskflow(taskflowId, {
          cluster: { _id: this.state[this.state.serverType].profile },
          fileId: this.props.simulation.metadata.inputFolder.files.dataset,
          sessionKey: sessionId, // for pvw, we use this later for connecting
        });
      })
      .then((resp) =>
        client.updateSimulationStep(this.props.simulation._id, this.props.step, {
          view: 'run',
          metadata: {
            taskflowId, sessionId,
          },
        })
      )
      .then((resp) => {
        var newSim = deepClone(this.props.simulation);
        newSim.steps[this.props.step].view = 'run';
        newSim.steps[this.props.step].metadata = {
          taskflowId, sessionId,
        };
        client.invalidateSimulation(newSim);

        this.context.router.replace({
          pathname: this.props.location.pathname,
          query: merge(this.props.location.query, {
            view: 'run',
          }),
          state: this.props.location.state,
        });
      })
      .catch((error) => {
        this.setState({ error: error.data.message });
      });
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
              <select
                className={formStyle.input}
                value={this.state.serverType}
                onChange={ this.updateServerType }
              >
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
      </div>);
  },
});
