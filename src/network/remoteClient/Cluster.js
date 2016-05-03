import girder from './GirderClient';
import { getJSON } from './Utils';

export function getClusterPresets() {
  return getJSON('/clusters-presets.json');
}

export function listClusterProfiles() {
  return girder.listClusters({ type: 'trad' });
}

export function createCluster(cluster) {
  return girder.createCluster(cluster);
}

export function deleteCluster(id) {
  return girder.deleteCluster(id);
}

export function saveCluster(cluster) {
  if (cluster._id) {
    return girder.updateCluster(cluster);
  }
  return girder.createCluster(cluster);
}

export function testCluster(id) {
  return girder.startCluster(id);
}

export function getCluster(id) {
  return girder.getCluster(id);
}

export function getClusterLog(id, offset = 0) {
  return girder.getClusterLogs(id, offset);
}
