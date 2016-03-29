import ButtonBar        from '../../../../../../panels/ButtonBar';
import JobMonitor       from '../../../../../../panels/JobMonitor';
import merge            from 'mout/src/object/merge';
import React            from 'react';

import { connect }      from 'react-redux';
import { dispatch }     from '../../../../../../redux';
import * as Actions     from '../../../../../../redux/actions/taskflows';
import * as SimActions  from '../../../../../../redux/actions/projects';


const ACTIONS = {
  terminate: { name: 'terminateTaskflow', label: 'Terminate', icon: '' },
  visualize: { name: 'visualizeTaskflow', label: 'Visualize', icon: '' },
  rerun: { name: 'deleteTaskflow', label: 'Rerun', icon: '' },
};

function getActions(actionsList, disabled) {
  return actionsList.map((action) => Object.assign({ disabled }, ACTIONS[action]));
}

const VisualizationView = React.createClass({
  displayName: 'pyfr/common/steps/Visualization/View',

  propTypes: {
    location: React.PropTypes.object,
    project: React.PropTypes.object,
    simulation: React.PropTypes.object,
    step: React.PropTypes.string,
    taskFlowName: React.PropTypes.string,
    view: React.PropTypes.string,

    onTerminateTaskflow: React.PropTypes.func,
    onDeleteTaskflow: React.PropTypes.func,
    onVisualizeTaskflow: React.PropTypes.func,
    onStatusChange: React.PropTypes.func,

    taskflowId: React.PropTypes.string,
    taskflow: React.PropTypes.object,
    error: React.PropTypes.string,
  },

  visualizeTaskflow() {
    const newSimState = Object.assign({}, this.props.simulation, { active: 'Visualization' });
    const location = {
      pathname: this.props.location.pathname,
      query: merge(this.props.location.query, { view: 'visualizer' }),
      state: this.props.location.state,
    };

    this.props.onVisualizeTaskflow(newSimState, location);
  },

  terminateTaskflow() {
    this.props.onTerminateTaskflow(this.props.taskflowId);
  },

  deleteTaskflow() {
    const simulationStep = {
      id: this.props.simulation._id,
      step: 'Visualization',
      data: {
        view: 'default',
        metadata: {},
      },
    };
    const location = {
      pathname: this.props.location.pathname,
      query: { view: 'default' },
      state: this.props.location.state,
    };

    this.props.onDeleteTaskflow(this.props.taskflowId, simulationStep, location);
  },

  buttonBarAction(action) {
    this[action]();
  },

  render() {
    if (!this.props.taskflow) {
      return null;
    }

    const { taskflow, taskflowId, simulation, error } = this.props;
    const jobs = Object.keys(taskflow.jobMapById).map(id => taskflow.jobMapById[id]);
    const tasks = Object.keys(taskflow.taskMapById).map(id => taskflow.taskMapById[id]);
    const allComplete = jobs.every(job => job.status === 'complete') && tasks.every(task => task.status === 'complete');
    const actions = [];
    const simulationStatus = [simulation.metadata.status];

    // name is paraview and status is running -> visualize
    if (jobs.some(job => job.name === 'paraview' && job.status === 'running')) {
      actions.push('visualize');
    }

    if (allComplete || jobs.every(job => job.status === 'terminated')) {
      // every job complete && task complete -> rerun
      simulationStatus.push('complete');
      actions.push('rerun');
    } else if (!allComplete && (jobs.length + tasks.length) > 0 && !jobs.some(job => job.status === 'terminating')) {
      // jobs are still running -> terminate
      simulationStatus.push('running');
      actions.push('terminate');
    }

    // Need to update simulation status
    // if (simulationStatus.length === 2 && simulationStatus[0] !== simulationStatus[1]) {
    //   this.props.onStatusChange(simulation, simulationStatus[1]);
    // }

    return (
      <div>
        <JobMonitor taskFlowId={ taskflowId } />
        <section>
          <ButtonBar
            onAction={ this.buttonBarAction }
            actions={ getActions(actions, false) }
            error={ error }
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
    var taskflowId = null;
    const activeProject = state.projects.active;
    const activeSimulation = activeProject ? state.projects.simulations[activeProject].active : null;

    if (activeSimulation) {
      const simulation = state.projects.simulations[activeProject].mapById[activeSimulation];
      taskflowId = simulation.steps.Visualization.metadata.taskflowId;
    }

    return {
      taskflowId,
      taskflow: taskflowId ? state.taskflows.mapById[taskflowId] : null,
      error: null,
    };
  },
  () => {
    return {
      onStatusChange: (simulation, status) => dispatch(SimActions.saveSimulation(Object.assign({}, simulation, { status }))),
      onVisualizeTaskflow: (sim, location) => dispatch(SimActions.saveSimulation(sim, null, location)),
      onDeleteTaskflow: (id, simulationStep, location) => dispatch(Actions.deleteTaskflow(id, simulationStep, location)),
      onTerminateTaskflow: (id) => dispatch(Actions.terminateTaskflow(id)),
    };
  }
)(VisualizationView);
