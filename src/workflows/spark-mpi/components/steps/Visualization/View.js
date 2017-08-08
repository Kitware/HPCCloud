import JobMonitoring   from '../../../../generic/components/steps/JobMonitoring';

import getNetworkError        from '../../../../../utils/getNetworkError';
import { getDisabledButtons } from '../../../../../utils/getDisabledButtons';
import get                    from '../../../../../utils/get';

import { connect }          from 'react-redux';
import { dispatch }         from '../../../../../redux';
import * as SimActions      from '../../../../../redux/actions/projects';

// ----------------------------------------------------------------------------

function getActions(props) {
  const { taskflow } = props;
  const jobs = Object.keys(taskflow.jobMapById).map((id) => taskflow.jobMapById[id]);
  const actions = [];

  taskflow.actions.forEach((action) => {
    actions.push(action);
  });

  // name is paraview and status is running -> visualize
  if (jobs.some((job) => job.name === props.primaryJob && job.status === 'running')) {
    actions.push('visualize');
  } else if (taskflow.allComplete) {
    actions.push('rerun');
  }

  return actions;
}

// ----------------------------------------------------------------------------

function onVisualize(props) {
  const location = {
    pathname: props.location.pathname,
    query: Object.assign({}, props.location.query, { view: 'visualizer' }),
    state: props.location.state,
  };
  dispatch(SimActions.saveSimulation(props.simulation, null, location));
}

// ----------------------------------------------------------------------------

export default connect(
  (state, props) => {
    var taskflowId = null;
    const activeProject = state.projects.active;
    const activeSimulation = activeProject ? state.projects.simulations[activeProject].active : null;

    if (activeSimulation) {
      const simulation = state.simulations.mapById[activeSimulation];
      taskflowId = simulation.steps.Visualization.metadata.taskflowId;
    }

    let taskflow = null;
    if (taskflowId) {
      taskflow = state.taskflows.mapById[taskflowId];
    }

    let cluster = null;
    if (get(taskflow, 'flow.meta.cluster._id')) {
      const clusterId = taskflow.flow.meta.cluster._id;
      cluster = state.preferences.clusters.mapById[clusterId];
    }

    return {
      getActions,
      taskflow,
      taskflowId,
      cluster,
      disabledButtons: getDisabledButtons(state.network, taskflow),
      error: getNetworkError(state, ['terminate_taskflow', 'delete_taskflow']),
      actionFunctions: { onVisualize },
    };
  }
)(JobMonitoring);
