import JobMonitoring   from '../../../../generic/components/steps/JobMonitoring';

import deepClone              from 'mout/src/lang/deepClone';
import get                    from '../../../../../utils/get';
import getNetworkError        from '../../../../../utils/getNetworkError';
import { getDisabledButtons } from '../../../../../utils/getDisabledButtons';

import { connect }          from 'react-redux';
import { dispatch }         from '../../../../../redux';
import * as SimActions      from '../../../../../redux/actions/projects';

// ----------------------------------------------------------------------------

function getActions(props) {
  const { taskflow } = props;
  const actions = [].concat(taskflow.actions ? taskflow.actions : []);
  if (taskflow.allComplete) {
    if (props.actionFunctions.onVisualize) {
      actions.push('visualize');
    } else {
      actions.push('rerun');
    }
  }
  return actions;
}

// ----------------------------------------------------------------------------

export function onVisualize(props) {
  const location = {
    pathname: `View/Simulation/${props.simulation._id}/Visualization`,
    query: Object.assign({}, props.location.query, { view: 'default' }),
    state: props.location.state,
  };
  const newSimState = deepClone(props.simulation);
  newSimState.steps.Visualization.metadata.dataDir = props.taskflow.flow.meta.dataDir;
  // newSimState.steps.Visualization.metadata.fileName = 'simulation/dataset.foam';
  newSimState.active = 'Visualization';
  newSimState.disabled = newSimState.disabled.filter(step => step !== 'Visualization');

  dispatch(SimActions.saveSimulation(newSimState, null, location));
}

// ----------------------------------------------------------------------------

export default connect(
  (state, props) => {
    var taskflowId = null;
    const activeProject = state.projects.active;
    const activeSimulation = activeProject ? state.projects.simulations[activeProject].active : null;

    if (activeSimulation) {
      const simulation = state.simulations.mapById[activeSimulation];
      taskflowId = simulation.steps.Simulation.metadata.taskflowId;
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
      taskflowId, cluster, taskflow,
      disabledButtons: getDisabledButtons(state.network, taskflow),
      error: getNetworkError(state, ['terminate_taskflow', 'delete_taskflow']),
      actionFunctions: props.actionFunctions,
    };
  }
)(JobMonitoring);
