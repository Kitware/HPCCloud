import ButtonBar        from '../../../../../../panels/ButtonBar';
import JobMonitor       from '../../../../../../panels/JobMonitor';
import FileListing      from '../../../../../../panels/FileListing';
import deepClone        from 'mout/src/lang/deepClone';
import merge            from 'mout/src/object/merge';
import React            from 'react';

import { connect }      from 'react-redux';
import { dispatch }     from '../../../../../../redux';
import * as Actions     from '../../../../../../redux/actions/taskflows';
import * as SimActions  from '../../../../../../redux/actions/projects';

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

const SimualtionView = React.createClass({
  displayName: 'pyfr/common/steps/Simulation/View',

  propTypes: {
    location: React.PropTypes.object,
    project: React.PropTypes.object,
    simulation: React.PropTypes.object,
    step: React.PropTypes.string,
    taskFlowName: React.PropTypes.string,
    primaryJob: React.PropTypes.string,
    view: React.PropTypes.string,

    onTerminateTaskflow: React.PropTypes.func,
    onDeleteTaskflow: React.PropTypes.func,
    onVisualizeTaskflow: React.PropTypes.func,

    taskflowId: React.PropTypes.string,
    taskflow: React.PropTypes.object,
    error: React.PropTypes.string,
  },

  onAction(action) {
    this[action]();
  },

  visualizeTaskflow() {
    const location = {
      pathname: `View/Simulation/${this.props.simulation._id}/Visualization`,
      query: merge(this.props.location.query, { view: 'default' }),
      state: this.props.location.state,
    };
    const newSimState = deepClone(this.props.simulation);
    newSimState.steps.Visualization.metadata.dataDir = this.props.taskflow.outputDirectory;
    newSimState.active = 'Visualization';
    newSimState.disabled = newSimState.disabled.filter(step => step !== 'Visualization');

    this.props.onVisualizeTaskflow(newSimState, location);
  },

  terminateTaskflow() {
    this.props.onTerminateTaskflow(this.props.taskflowId);
  },

  deleteTaskflow() {
    const simulationStep = {
      id: this.props.simulation._id,
      step: 'Simulation',
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

  render() {
    if (!this.props.taskflow || !this.props.taskflow.flow) {
      return null;
    }

    const { taskflow, taskflowId, simulation, error } = this.props;
    const actions = [].concat(taskflow.actions);

    // Extract meaningful information from props
    if (taskflow.allComplete) {
      actions.push('visualize');
    }

    return (
      <div>
        <JobMonitor taskflowId={ taskflowId } />
        <FileListing title="Input Files" folderId={simulation.metadata.inputFolder._id} />
        <FileListing title="Output Files" folderId={simulation.metadata.outputFolder._id} />
        <section>
            <ButtonBar
              onAction={ this.onAction }
              actions={ getActions(actions, false) }
              error={ error}
            />
        </section>
      </div>);
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
      const simulation = state.simulations.mapById[activeSimulation];
      taskflowId = simulation.steps.Simulation.metadata.taskflowId;
    }

    return {
      taskflowId,
      taskflow: taskflowId ? state.taskflows.mapById[taskflowId] : null,
      error: null,
    };
  },
  () => {
    return {
      onVisualizeTaskflow: (sim, location) => {
        dispatch(SimActions.saveSimulation(sim, null));
        const metadata = sim.steps.Visualization.metadata;
        dispatch(SimActions.updateSimulationStep(sim._id, 'Visualization', { metadata }, location));
      },
      onDeleteTaskflow: (id, simulationStep, location) => dispatch(Actions.deleteTaskflow(id, simulationStep, location)),
      onTerminateTaskflow: (id) => dispatch(Actions.terminateTaskflow(id)),
    };
  }
)(SimualtionView);

