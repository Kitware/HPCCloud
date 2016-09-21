import get from './get';
import { taskflowActions } from './Constants';
import Theme               from 'HPCCloudStyle/Theme.mcss';

export function getActions(actionsList, disabled) {
  return actionsList.map((action) => Object.assign(
    taskflowActions[action],
    {
      disabled: !!disabled[action],
      icon: !!disabled[action] ? Theme.loadingIcon : null,
    }));
}

export function getDisabledButtons(network, taskflow = {}) {
  const disabledButtons = {};
  const actions = get(taskflow, 'actions');
  const taskflowId = get(taskflow, 'flow._id');
  const clusterId = get(taskflow, 'flow.meta.cluster._id');

  if (!actions) {
    return disabledButtons;
  }

  actions.forEach((el) => {
    switch (el) {
      case 'terminate':
        disabledButtons.terminate =
          !!get(network, `pending.terminate_taskflow_${taskflowId}`) ||
          !!get(network, `success.terminate_taskflow_${taskflowId}`);
        break;
      case 'terminateInstance':
        console.log(clusterId);
        disabledButtons.terminateInstance =
          !!get(network, `pending.terminate_cluster_${clusterId}`) ||
          !!get(network, `success.terminate_cluster_${clusterId}`);
        break;
      default:
        break;
    }
  });

  return disabledButtons;
}
