import React                   from 'react';

import ButtonBar               from '../../../../../../panels/ButtonBar';
import defaultServerParameters from '../../../../../../panels/run/defaults';
import RunCluster              from '../../../../../../panels/run/RunCluster';
import RunEC2                  from '../../../../../../panels/run/RunEC2';
import RunOpenStack            from '../../../../../../panels/run/RunOpenStack';
import RuntimeBackend          from '../../../panels/RuntimeBackend';

import client                  from '../../../../../../network';
import deepClone               from 'mout/src/lang/deepClone';
import merge                   from 'mout/src/object/merge';
import formStyle               from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({

  displayName: 'pyfr/common/steps/Simulation/Start',

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
    if (defaultServerParameters.Traditional.profile) {
      this.fetchCluster(defaultServerParameters.Traditional.profile);
    }
    return {
      serverType: 'Traditional',
      EC2: defaultServerParameters.EC2,
      Traditional: defaultServerParameters.Traditional,
      OpenStack: defaultServerParameters.OpenStack,
      clusters: {},
      backend: {},
      error: '',
    };
  },

  fetchCluster(clusterId) {
    client.getCluster(clusterId)
      .then(
        cluster => {
          const clusters = Object.assign({}, this.state.clusters, { [clusterId]: cluster.data });
          this.setState({ clusters });
        },
        err => {
          console.log('Error fetching cluster', clusterId, err);
        });
  },

  dataChange(key, value, which) {
    var profile = this.state[which];
    profile[key] = value;
    this.setState({ [which]: profile });

    if (which === 'Traditional' && key === 'profile' && !this.state.clusters[value]) {
      this.fetchCluster(value);
    }
  },

  runSimulation(event) {
    var taskflowId,
      sessionId = btoa(new Float64Array(3).map(Math.random)).substring(0, 96);

    client.createTaskflow(this.props.taskFlowName)
      .then((resp) => {
        var file = {
          _id: this.props.simulation.metadata.inputFolder.files.ini,
          name: 'pyfr.ini', // the ini file must be named this.
        };
        taskflowId = resp.data._id;
        return client.editFile(file);
      })
      .then((resp) => {
        const meshFile = this.props.simulation.metadata.inputFolder.files.mesh || this.props.project.metadata.inputFolder.files.mesh;
        return client.startTaskflow(taskflowId, Object.assign({},
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
            },
            output: {
              folder: {
                id: this.props.simulation.metadata.outputFolder._id,
              },
            },
            cluster: {
              _id: this.state[this.state.serverType].profile,
            },
          })
        );
      })
      .then((resp) =>
        client.updateSimulationStep(this.props.simulation._id, 'Simulation', {
          view: 'run',
          metadata: {
            taskflowId, sessionId,
          },
        })
      )
      .then((resp) => {
        var newSim = deepClone(this.props.simulation);
        newSim.steps.Simulation.view = 'run';
        newSim.steps.Simulation.metadata = {
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
    const serverType = e.target.value;
    this.setState({ serverType });
  },

  updateBakend(backend) {
    this.setState({ backend });
  },

  render() {
    var actions = [{ name: 'runSimulation', label: 'Run Simulation', icon: '' }],
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

    let profiles = { cuda: false, openmp: [], opencl: [] };
    if (this.state.serverType === 'Traditional') {
      const clusterId = this.state.Traditional.profile;
      if (this.state.clusters[clusterId] && this.state.clusters[clusterId].config && this.state.clusters[clusterId].config.pyfr) {
        profiles = this.state.clusters[clusterId].config.pyfr;
      }
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
          <RuntimeBackend profiles={profiles} onChange={ this.updateBakend } />
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
