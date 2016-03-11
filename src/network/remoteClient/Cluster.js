import girder from './GirderClient';

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
