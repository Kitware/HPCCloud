import get from './get';

export default function getDisabledButtons(network, taskflow = {}) {
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

  console.log(actions, taskflowId, clusterId, actions);
  return disabledButtons;
}
