import ButtonBar        from '../../../../../../panels/ButtonBar';
import client           from '../../../../../../network';
import JobMonitor       from '../../../../../../panels/JobMonitor';
import OutputPanel      from '../../../../../../panels/OutputPanel';
import merge            from 'mout/src/object/merge';
import React            from 'react';
import style            from 'HPCCloudStyle/JobMonitor.mcss';
import TaskflowManager  from '../../../../../../network/TaskflowManager';

const primaryJob = 'pyfr_run';
const ACTIONS = {
  terminate: {
    name: 'terminateTaskflow',
    label: 'Terminate',
    icon: '',
  },
  visualize: {
    name: 'visualizeTaskflow',
    label: 'Visualize',
    icon: '',
  },
  rerun: {
    name: 'deleteTaskflow',
    label: 'Rerun',
    icon: '',
  },
};

function getActions(actionsList, disabled) {
  return actionsList.map((action) => Object.assign({ disabled }, ACTIONS[action]));
}

export default React.createClass({
  displayName: 'pyfr/common/steps/Simulation/View',

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
      allComplete: false,
      taskflowId: '',
      error: '',
      primaryJobOutput: '', // string of the file system output directory of the primary job
      wfOutput: [], // array of objects with: {name: $filename, value: JSX <a href=api/v1/item/$id/download>}
      actions: [
        'terminate',
      ],
      actionsDisabled: false,
    };
  },

  componentWillMount() {
    const taskflowId = this.props.simulation.steps.Simulation.metadata.taskflowId;
    this.setState({ taskflowId });

    this.subscription = TaskflowManager.monitorTaskflow(taskflowId, (pkt) => {
      const actions = [];
      var primaryJobOutput = '';
      var simNeedsUpdate = false;
      var actionsDisabled = this.state.actionsDisabled;
      var allComplete = pkt.jobs.every(job => job.status === 'complete') && pkt.tasks.every(task => task.status === 'complete');

      // every terminated -> rerun
      if (pkt.jobs.every(job => job.status === 'terminated')) {
        this.props.simulation.metadata.status = 'terminated';
        actions.push('rerun');
        simNeedsUpdate = true;
        actionsDisabled = false;
      // some running -> terminate
      } else if (!allComplete && (pkt.jobs.length + pkt.tasks.length) > 0 && !pkt.jobs.some(job => job.status === 'terminating')) {
        this.props.simulation.metadata.status = 'running';
        actions.push('terminate');
        simNeedsUpdate = true;
      // every job complete && task complete -> visualize
      } else if (allComplete) {
        this.props.simulation.metadata.status = 'complete';
        actions.push('visualize');
        simNeedsUpdate = true;
      }

      if (simNeedsUpdate) {
        client.saveSimulation(this.props.simulation)
          .then(resp => {
            client.invalidateSimulation(resp);
          });
      }

      for (let i = 0; i < pkt.jobs.length && !primaryJobOutput; i++) {
        if (pkt.jobs[i].name === primaryJob) {
          primaryJobOutput = pkt.jobs[i].dir;
          break;
        }
      }

      // Refresh ui
      this.setState({ actions, primaryJobOutput, allComplete, actionsDisabled });
    });
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.primaryJobOutput && nextState.wfOutput.length === 0) {
      client.listItems({ folderId: this.props.simulation.metadata.outputFolder._id })
        .then((resp) => {
          var promises = resp.data.map((item) => client.getItem(item._id));
          return Promise.all(promises);
        })
        .then((resps) => {
          var wfOutput = resps.map(item => ({
            name: item.data.name,
            value: <a href={`api/v1/item/${item.data._id}/download`} target="_blank">
              <i className={style.downloadIcon}></i> { item.data._id }
            </a>,
          }));
          this.setState({ wfOutput });
        })
        .catch((err) => {
          var msg = err.data && err.data.message ? err.data.message : err;
          console.log(msg);
        });
    }

    return true;
  },

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  },

  onAction(action) {
    this[action]();
  },

  fetchWfOutput() {
    console.log('should fetch wf output');
  },

  visualizeTaskflow() {
    var newSim = this.props.simulation;
    newSim.steps.Visualization.metadata.dataDir = this.state.primaryJobOutput;
    client.saveSimulation(newSim)
      .then((resp) => {
        client.invalidateSimulation(newSim);
        return client.activateSimulationStep(this.props.simulation, 'Visualization', null);
      })
      .then((resp) => {
        this.context.router.replace({
          pathname: `View/Simulation/${this.props.simulation._id}/Visualization`,
          query: merge(this.props.location.query, { view: 'default' }),
          state: this.props.location.state,
        });
      })
      .catch((err) => {
        console.log('error: ', err);
      });
  },

  terminateTaskflow() {
    this.setState({ actionsDisabled: true });
    TaskflowManager.terminateTaskflow(this.props.simulation.steps.Simulation.metadata.taskflowId);
  },

  deleteTaskflow() {
    TaskflowManager.deleteTaskflow(this.props.simulation.steps.Simulation.metadata.taskflowId)
      .then((resp) =>
        client.updateSimulationStep(this.props.simulation._id, 'Simulation', {
          view: 'default',
          metadata: {},
        })
      )
      .then((resp) => {
        this.context.router.replace({
          pathname: this.props.location.pathname,
          query: { view: 'default' },
          state: this.props.location.state,
        });
      })
      .catch((error) => {
        this.setState({ error: error.data.message });
      });
  },

  render() {
    var outputItems;
    var outputComponent = null;
    if (this.state.allComplete) {
      outputItems = [{ name: this.props.simulation.steps.Simulation.metadata.cluster, value: this.state.primaryJobOutput }]
        .concat(this.state.wfOutput);
      outputComponent = <OutputPanel title="Output" items={outputItems} />;
    }
    return (
      <div>
        <JobMonitor taskFlowId={ this.state.taskflowId } />
        { outputComponent }
        <section>
            <ButtonBar
              onAction={ this.onAction }
              actions={ getActions(this.state.actions, this.state.actionsDisabled) }
              error={this.state.error}
            />
        </section>
      </div>);
  },
});
