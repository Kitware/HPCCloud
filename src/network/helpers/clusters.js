import girder from '../';

export function saveCluster(cluster) {
  if (cluster._id) {
    return girder.updateCluster(cluster);
  }
  return girder.createCluster(cluster);
}
