import girder from './GirderClient';

export function getClusterPresets() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    function extractResponse(ctx) {
      return {
        ctx,
        data: JSON.parse(xhr.responseText),
        status: xhr.status,
        statusText: xhr.statusText,
        headers: {},
        config: {},
      };
    }

    xhr.addEventListener('load', event => {
      resolve(extractResponse('load'));
    });
    xhr.addEventListener('error', event => {
      console.log('Get Cluster preset as failed', event);
      reject(extractResponse('error'));
    });
    xhr.addEventListener('abort', event => {
      console.log('Get Cluster preset as been canceled', event);
      reject(extractResponse('abort'));
    });

    xhr.open('GET', '/clusters-presets.json', true);
    xhr.responseType = 'text';
    xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    xhr.send();
  });
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
