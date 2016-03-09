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
        ACTIONS.terminate,
      ],
    };
  },

  componentWillMount() {
    const taskflowId = this.props.simulation.steps[this.props.simulation.active].metadata.taskflowId;
    this.setState({ taskflowId });

    this.subscription = TaskflowManager.monitorTaskflow(taskflowId, (pkt) => {
      const actions = [];

      // name is paraview and status is running -> visualize
      if (pkt.jobs.some(job => job.name === 'paraview' && job.status === 'running')) {
        actions.push(ACTIONS.visualize);
      }

      // some running -> terminate
      if (pkt.jobs.some(job => job.status === 'running')) {
        actions.push(ACTIONS.terminate);
      // every status complete || terminated -> rerun
      } else if (pkt.jobs.every(job => job.status === 'complete') ||
          pkt.jobs.every(job => job.status === 'terminated')) {
        actions.push(ACTIONS.rerun);
      }

      // Refresh ui
      this.setState({ actions });
    });
  },

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  },

  visualizeTaskflow() {
    this.context.router.replace({
      pathname: this.props.location.pathname,
      query: merge(this.props.location.query, { view: 'visualizer' }),
      state: this.props.location.state,
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

  onAction(action) {
    this[action]();
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
