export const baseURL = '/api/v1';

// name: action in component that this action runs
// label: the button's label
// icon: an fa icon, import styles here and include them if desired.
export const taskflowActions = {
  terminate: { name: 'terminateTaskflow', label: 'Terminate', icon: '' },
  visualize: { name: 'visualizeTaskflow', label: 'Visualize', icon: '' },
  rerun: { name: 'deleteTaskflow', label: 'Rerun', icon: '' },
  terminateInstance: { name: 'terminateInstance', label: 'Terminate EC2 Instance', icon: '' },
};
