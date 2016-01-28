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
