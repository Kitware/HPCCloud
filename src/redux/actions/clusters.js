import * as netActions  from './network';
import client           from '../../network';
import store            from '..';

export const ADD_CLUSTER = 'ADD_CLUSTER';
export const UPDATE_ACTIVE_CLUSTER = 'UPDATE_ACTIVE_CLUSTER';
export const UPDATE_CLUSTERS = 'UPDATE_CLUSTERS';
export const UPDATE_CLUSTER_PRESETS = 'UPDATE_CLUSTER_PRESETS';
export const REMOVE_CLUSTER = 'REMOVE_CLUSTER';
export const SAVE_CLUSTER = 'SAVE_CLUSTER';
export const TEST_CLUSTER = 'TEST_CLUSTER';
export const PENDING_CLUSTER_NETWORK = 'PENDING_CLUSTER_NETWORK';
export const CLUSTER_APPLY_PRESET = 'CLUSTER_APPLY_PRESET';
export const TESTING_CLUSTER = 'TESTING_CLUSTER';

/* eslint-disable no-shadow */

export function addCluster() {
  return { type: ADD_CLUSTER };
}
export function applyPreset(index, name) {
  return { type: CLUSTER_APPLY_PRESET, index, name };
}

export function updateActiveCluster(index) {
  return { type: UPDATE_ACTIVE_CLUSTER, index };
}

export function updateClusters(clusters) {
  return { type: UPDATE_CLUSTERS, clusters };
}

export function updateClusterPresets(presets) {
  return { type: UPDATE_CLUSTER_PRESETS, presets };
}

export function pendingNetworkCall(pending = true) {
  return { type: PENDING_CLUSTER_NETWORK, pending };
}

export function fetchClusterPresets() {
  return dispatch => {
    const action = netActions.addNetworkCall('fetch_cluster_presets', 'Retreive cluster presets');

    dispatch(pendingNetworkCall(true));

    client.getClusterPresets()
      .then(
        presets => {
          dispatch(netActions.successNetworkCall(action.id, presets));
          dispatch(updateClusterPresets(presets.data));
          dispatch(pendingNetworkCall(false));
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
          dispatch(pendingNetworkCall(false));
        });

    return action;
  };
}

export function fetchClusters() {
  return dispatch => {
    const action = netActions.addNetworkCall('fetch_clusters', 'Retreive clusters');

    dispatch(pendingNetworkCall(true));
    client.listClusterProfiles()
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(updateClusters(resp.data));
          dispatch(pendingNetworkCall(false));
        },
        err => {
          dispatch(netActions.errorNetworkCall(action.id, err));
          dispatch(pendingNetworkCall(false));
        });

    return action;
  };
}

export function removeCluster(index, cluster) {
  return dispatch => {
    if (cluster._id) {
      const action = netActions.addNetworkCall('remove_cluster', 'Remove cluster');

      dispatch(pendingNetworkCall(true));
      client.deleteCluster(cluster._id)
        .then(
          resp => {
            dispatch(netActions.successNetworkCall(action.id, resp));
            dispatch(pendingNetworkCall(false));
            dispatch(fetchClusters());
          },
          err => {
            dispatch(netActions.errorNetworkCall(action.id, err));
            dispatch(pendingNetworkCall(false));
          });

      return action;
    }

    return { type: REMOVE_CLUSTER, index };
  };
}

export function updateCluster(index, cluster, pushToServer = false) {
  return dispatch => {
    const saveAction = { type: SAVE_CLUSTER, index, cluster };
    if (pushToServer) {
      const action = netActions.addNetworkCall('save_cluster', 'Save cluster');
      dispatch(pendingNetworkCall(true));
      client.saveCluster(cluster)
        .then(
          resp => {
            dispatch(pendingNetworkCall(false));
            dispatch(netActions.successNetworkCall(action.id, resp));
          },
          err => {
            dispatch(netActions.errorNetworkCall(action.id, err));
            dispatch(pendingNetworkCall(false));
          });
    }
    return saveAction;
  };
}

export function testCluster(index, cluster) {
  return dispatch => {
    if (!cluster._id) {
      return { type: 'NO_OP', message: 'Cluster is not available on server yet' };
    }

    const action = netActions.addNetworkCall('test_cluster', 'Test cluster');
    dispatch(pendingNetworkCall(true));
    dispatch(action);

    client.testCluster(cluster._id)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(pendingNetworkCall(false));
          dispatch(fetchClusters());
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
          dispatch(pendingNetworkCall(false));
        });

    return { type: TESTING_CLUSTER, index };
  };
}

client.onEvent((e) => {
  if (e.type === 'cluster.status') {
    store.dispatch(fetchClusters());
  }
});

// No need to be authenticated
setImmediate(() => {
  store.dispatch(fetchClusterPresets());
});

// Auto trigger actions on authentication change...
client.onAuthChange(authenticated => {
  if (authenticated) {
    store.dispatch(fetchClusters());
  } else {
    store.dispatch(updateClusters([]));
  }
});
