import ButtonBar        from '../../../../../../panels/ButtonBar';
import client           from '../../../../../../network';
import JobMonitor       from '../../../../../../panels/JobMonitor';
import merge            from 'mout/src/object/merge';
import React            from 'react';
import TaskflowManager  from '../../../../../../network/TaskflowManager';

const ACTIONS = {
  terminate: { name: 'terminateTaskflow', label: 'Terminate', icon: '' },
  visualize: { name: 'visualizeTaskflow', label: 'Visualize', icon: '' },
  rerun: { name: 'deleteTaskflow', label: 'Rerun', icon: '' },
};

export default React.createClass({
  displayName: 'pyfr/common/steps/Visualization/View',

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
      actions: [
        ACTIONS.terminate,
      ],
    };
  },

  componentWillMount() {
    const taskflowId = this.props.simulation.steps.Visualization.metadata.taskflowId;
    this.setState({ taskflowId });

    this.subscription = TaskflowManager.monitorTaskflow(taskflowId, (pkt) => {
      const actions = [];
      var simNeedsUpdate = false;
      var allComplete = pkt.jobs.every(job => job.status === 'complete') && pkt.tasks.every(task => task.status === 'complete');

      // name is paraview and status is running -> visualize
      if (pkt.jobs.some(job => job.name === 'paraview' && job.status === 'running')) {
        actions.push(ACTIONS.visualize);
      }

      // jobs are still running -> terminate
      if (!allComplete && (pkt.jobs.length + pkt.tasks.length) > 0) {
        this.props.simulation.metadata.status = 'running';
        actions.push(ACTIONS.terminate);
        simNeedsUpdate = true;
      // every job complete && task complete -> rerun
      } else if (allComplete || pkt.jobs.every(job => job.status === 'terminated')) {
        this.props.simulation.metadata.status = 'complete';
        actions.push(ACTIONS.rerun);
        simNeedsUpdate = true;
      }

      if (simNeedsUpdate) {
        client.saveSimulation(this.props.simulation)
          .then(resp => {
            client.invalidateSimulation(resp);
          });
      }

      // Refresh ui
      this.setState({ actions, allComplete });
    });
  },

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  },

  visualizeTaskflow() {
    client.activateSimulationStep(this.props.simulation, 'Visualization', null)
      .then((resp) => {
        this.context.router.push({
          pathname: this.props.location.pathname,
          query: merge(this.props.location.query, { view: 'visualizer' }),
          state: this.props.location.state,
        });
      })
      .catch((err) => {
        console.log('error: ', err);
      });
  },

  terminateTaskflow() {
    TaskflowManager.terminateTaskflow(this.props.simulation.steps[this.props.simulation.active].metadata.taskflowId);
  },

  deleteTaskflow() {
    TaskflowManager.deleteTaskflow(this.props.simulation.steps[this.props.simulation.active].metadata.taskflowId)
      .then((resp) =>
        client.updateSimulationStep(this.props.simulation._id, this.props.step, {
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

  buttonBarAction(action) {
    this[action]();
  },

  render() {
    return (
      <div>
        <JobMonitor taskFlowId={ this.state.taskflowId } />
        <section>
          <ButtonBar
            onAction={ this.buttonBarAction }
            actions={ this.state.actions }
            error={this.state.error}
          />
        </section>
      </div>
    );
  },
});
