import ButtonBar        from '../../../../../../panels/ButtonBar';
import client           from '../../../../../../network';
import JobMonitor       from '../../../../../../panels/JobMonitor';
import merge            from 'mout/src/object/merge';
import React            from 'react';
import TaskflowManager  from '../../../../../../network/TaskflowManager';

const ACTIONS = {
  terminate: { name: 'terminateTaskflow', label: 'Terminate', icon: '' },
  visualize: { name: 'visualizeTaskflow', label: 'Visualize', icon: '' },
  rerun: { name: 'deleteTaskflow', label: 'New visualization', icon: '' },
};

function getActions(actionsList, disabled) {
  return actionsList.map((action) => Object.assign({ disabled }, ACTIONS[action]));
}

export default React.createClass({
  displayName: 'pvw/view-visualization',

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
        'terminate',
      ],
      actionsDisabled: false,
    };
  },

  componentWillMount() {
    const taskflowId = this.props.simulation.steps[this.props.simulation.active].metadata.taskflowId;
    this.setState({ taskflowId });

    this.subscription = TaskflowManager.monitorTaskflow(taskflowId, (pkt) => {
      const actions = [];
      var simNeedsUpdate = false;
      var actionsDisabled = this.state.actionsDisabled;
      var allComplete = pkt.jobs.every(job => job.status === 'complete') && pkt.tasks.every(task => task.status === 'complete');

      // name is paraview and status is running -> visualize
      if (pkt.jobs.some(job => job.name === 'paraview' && job.status === 'running')) {
        actions.push('visualize');
      }

      // every status complete || terminated -> rerun
      if (pkt.jobs.every(job => job.status === 'complete') ||
          pkt.jobs.every(job => job.status === 'terminated')) {
        this.props.simulation.metadata.status = 'terminated';
        actions.push('rerun');
        simNeedsUpdate = true;
        actionsDisabled = false;
      // some running -> terminate
      } else if (!allComplete && (pkt.jobs.length + pkt.tasks.length) > 0 && !pkt.jobs.some(job => job.status === 'terminating')) {
        this.props.simulation.metadata.status = 'running';
        actions.push('terminate');
        simNeedsUpdate = true;
      }

      if (simNeedsUpdate) {
        client.saveSimulation(this.props.simulation)
          .then(resp => {
            client.invalidateSimulation(resp);
          });
      }

      // Refresh ui
      this.setState({ actions, actionsDisabled });
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
    this.context.router.replace({
      pathname: this.props.location.pathname,
      query: merge(this.props.location.query, { view: 'visualizer' }),
      state: this.props.location.state,
    });
  },

  terminateTaskflow() {
    this.setState({ actionsDisabled: true });
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

  render() {
    return (
      <div>
          <JobMonitor taskFlowId={ this.state.taskflowId } />
          <section>
              <ButtonBar
                onAction={ this.onAction }
                actions={ getActions(this.state.actions, this.state.actionsDisabled)}
                error={this.state.error}
              />
          </section>
      </div>);
  },
});
