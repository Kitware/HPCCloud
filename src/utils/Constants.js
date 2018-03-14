import breadCrumbStyle from 'HPCCloudStyle/Theme.mcss';

export const baseURL = '/api/v1';

// name: action in component that this action runs
// label: the button's label
// icon: an fa icon, import styles here and include them if desired.
export const taskflowActions = {
  deleteCluster: { name: 'onDeleteCluster', label: 'Delete Cluster', icon: '' },
  terminate: { name: 'onTerminate', label: 'Terminate', icon: '' },
  visualize: { name: 'onVisualize', label: 'Visualize', icon: '' },
  rerun: { name: 'onRerun', label: 'Rerun', icon: '' },
  terminateInstance: {
    name: 'onTerminateInstance',
    label: 'Terminate EC2 Instance',
    icon: '',
  },
  moveOffline: { name: 'moveOffline', label: 'Move Files Offline', icon: '' },
};

export const volumeTypes = {
  'General Purpose SSD': 'GP2',
  'Provisioned IOPS SSD': 'IO1',
  Magnetic: 'Magnetic',
  'Throughput Optimized HDD': 'ST1',
  'Cold HDD': 'SC1',
};

export function primaryBreadCrumbs(projectId = null, simulationId = null) {
  var ret = {
    paths: ['/'],
    icons: [breadCrumbStyle.breadCrumbRootIcon],
    titles: ['Home'],
  };
  if (projectId) {
    ret.paths.push(`/View/Project/${projectId}`);
    ret.icons.push(breadCrumbStyle.breadCrumbProjectIcon);
    ret.titles.push('Project');
    if (simulationId) {
      ret.paths.push(`/View/Simulation/${simulationId}`);
      ret.icons.push(breadCrumbStyle.breadCrumbSimulationIcon);
      ret.titles.push('Simulation');
    }
  }
  return ret;
}
