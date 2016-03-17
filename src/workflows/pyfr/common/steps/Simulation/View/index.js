import ButtonBar        from '../../../../../../panels/ButtonBar';
import client           from '../../../../../../network';
import JobMonitor       from '../../../../../../panels/JobMonitor';
import merge            from 'mout/src/object/merge';
import React            from 'react';
import TaskflowManager  from '../../../../../../network/TaskflowManager';

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
      taskflowId: '',
      error: '',
      primaryJobOutput: '',
      actions: [
        ACTIONS.terminate,
      ],
    };
  },

  componentWillMount() {
    const taskflowId = this.props.simulation.steps.Simulation.metadata.taskflowId;
    this.setState({ taskflowId });

    this.subscription = TaskflowManager.monitorTaskflow(taskflowId, (pkt) => {
      const actions = [];
      const primaryJob = 'pyfr_run';
      var primaryJobOutput = '';

      // some running -> terminate
      if (pkt.jobs.some(job => job.status === 'running') && pkt.jobs.some(job => job.name === primaryJob)) {
        actions.push(ACTIONS.terminate);
      // every job complete && task complete -> visualize
      } else if (pkt.jobs.every(job => job.status === 'complete') && pkt.tasks.every(task => task.status === 'complete')) {
        actions.push(ACTIONS.visualize);
      // every terminated -> rerun
      } else if (pkt.jobs.every(job => job.status === 'terminated')) {
        actions.push(ACTIONS.rerun);
      }

      for (let i = 0; i < pkt.jobs.length; i++) {
        if (pkt.jobs[i].name === primaryJob) {
          primaryJobOutput = pkt.jobs[i].dir;
          break;
        }
      }

      // Refresh ui
      this.setState({ actions, primaryJobOutput });
    });
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
    return (
      <div>
        <JobMonitor taskFlowId={ this.state.taskflowId } />
        <section>
            <ButtonBar
              onAction={ this.onAction }
              actions={ this.state.actions }
              error={this.state.error}
            />
        </section>
      </div>);
  },
});
