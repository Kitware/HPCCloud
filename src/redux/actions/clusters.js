import * as netActions  from './network';
import client           from '../../network';
import { dispatch }     from '..';
import { baseURL }      from '../../utils/Constants.js';

export const ADD_CLUSTER = 'ADD_CLUSTER';
export const UPDATE_ACTIVE_CLUSTER = 'UPDATE_ACTIVE_CLUSTER';
export const UPDATE_CLUSTERS = 'UPDATE_CLUSTERS';
export const UPDATE_CLUSTER_PRESETS = 'UPDATE_CLUSTER_PRESETS';
export const UPDATE_CLUSTER_STATUS = 'UPDATE_CLUSTER_STATUS';
export const REMOVE_CLUSTER = 'REMOVE_CLUSTER';
export const SAVE_CLUSTER = 'SAVE_CLUSTER';
export const TEST_CLUSTER = 'TEST_CLUSTER';
export const PENDING_CLUSTER_NETWORK = 'PENDING_CLUSTER_NETWORK';
export const CLUSTER_APPLY_PRESET = 'CLUSTER_APPLY_PRESET';
export const TESTING_CLUSTER = 'TESTING_CLUSTER';
export const UPDATE_CLUSTER_LOG = 'UPDATE_CLUSTER_LOG';
export const SUB_CLUSTER_LOG = 'SUB_CLUSTER_LOG';
export const UNSUB_CLUSTER_LOG = 'UNSUB_CLUSTER_LOG';

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

export function updateClusters(clusters, type) {
  return { type: UPDATE_CLUSTERS, clusters };
}

export function updateClusterPresets(presets) {
  return { type: UPDATE_CLUSTER_PRESETS, presets };
}

export function pendingNetworkCall(pending = true) {
  return { type: PENDING_CLUSTER_NETWORK, pending };
}

export function updateClusterLog(id, log) {
  return { type: UPDATE_CLUSTER_LOG, id, log };
}

export function updateClusterStatus(id, status) {
  return { type: UPDATE_CLUSTER_STATUS, id, status };
}

export function getClusterLog(id, offset) {
  return dispatch => {
    const action = netActions.addNetworkCall(`cluster_log_${id}`, 'Check cluster log');
    client.getClusterLog(id, offset)
      .then(resp => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateClusterLog(id, resp.data.log));
      })
      .catch(error => {
        dispatch(netActions.errorNetworkCall(action.id, error));
      });
    return action;
  };
}

export function subscribeClusterLogStream(id, offset = 0) {
  var eventSource = null;
  dispatch(getClusterLog(id, offset));
  if (EventSource) {
    eventSource = new EventSource(`${baseURL}/clusters/${id}/log/stream`);
    eventSource.onmessage = (e) => {
      var parsedLog = JSON.parse(e.data);
      dispatch(updateClusterLog(id, parsedLog));
    };

    eventSource.onerror = (e) => {
      // Wait 10 seconds if the browser hasn't reconnected then
      // reinitialize.
      setTimeout(() => {
        if (eventSource && eventSource.readyState === 2) {
          subscribeClusterLogStream(id);
        } else {
          eventSource = null;
        }
      }, 10000);
    };
  }
  return { type: SUB_CLUSTER_LOG, id, eventSource };
}

export function unsubscribeClusterLogStream(id) {
  return { type: UNSUB_CLUSTER_LOG, id };
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

export function fetchClusters(type = 'trad') {
  return dispatch => {
    const action = netActions.addNetworkCall('fetch_clusters', 'Retreive clusters');
    dispatch(pendingNetworkCall(true));
    client.listClusterProfiles(type)
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

export function terminateCluster(id) {
  const action = netActions.addNetworkCall('terminate_cluster', 'terminate cluster');
  client.terminateCluster(id)
    .then((resp) => {
      dispatch(netActions.successNetworkCall(action.id, resp));
    })
    .catch((err) => {
      console.log(err);
    });
  return { type: 'NOOP' };
}

// Auto trigger actions on authentication change...
client.onAuthChange(authenticated => {
  if (authenticated) {
    dispatch(fetchClusters('trad'));
    dispatch(fetchClusters('ec2'));
    dispatch(fetchClusterPresets());
  } else {
    dispatch(updateClusters([]));
  }
});
