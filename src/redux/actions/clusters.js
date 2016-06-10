import * as netActions       from './network';
import * as TaskflowActions  from './taskflows';
import client                from '../../network';
import * as ClusterHelper    from '../../network/helpers/clusters';
import { store, dispatch }   from '..';
import { baseURL }           from '../../utils/Constants.js';

export const ADD_CLUSTER = 'ADD_CLUSTER';
export const ADD_EXISTING_CLUSTER = 'ADD_EXISTING_CLUSTER';
export const REMOVE_CLUSTER_BY_ID = 'REMOVE_CLUSTER_BY_ID';
export const UPDATE_EXISTING_CLUSTER = 'UPDATE_EXISTING_CLUSTER';
export const UPDATE_ACTIVE_CLUSTER = 'UPDATE_ACTIVE_CLUSTER';
export const UPDATE_CLUSTERS = 'UPDATE_CLUSTERS';
export const UPDATE_CLUSTER_PRESETS = 'UPDATE_CLUSTER_PRESETS';
export const UPDATE_CLUSTER_STATUS = 'UPDATE_CLUSTER_STATUS';
export const REMOVE_CLUSTER = 'REMOVE_CLUSTER';
export const SAVE_CLUSTER = 'SAVE_CLUSTER';
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

// called if we get a cluster sse, we add it to the mapById
export function addExistingCluster(cluster) {
  return { type: ADD_EXISTING_CLUSTER, cluster };
}

export function applyPreset(index, name) {
  return { type: CLUSTER_APPLY_PRESET, index, name };
}

// removes cluster from mapById
// (see removeCluster(index, cluster) belows)
export function removeClusterById(id) {
  return { type: REMOVE_CLUSTER_BY_ID, id };
}

export function updateActiveCluster(index) {
  return { type: UPDATE_ACTIVE_CLUSTER, index };
}

export function updateExistingCluster(cluster) {
  return { type: UPDATE_EXISTING_CLUSTER, cluster };
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

function updateTaskflowActionsForClusterEvent(cluster, status) {
  if (cluster.type !== 'ec2') {
    return;
  }
  const tfMapById = Object.assign({}, store.getState().taskflows.mapById);
  const keys = Object.keys(tfMapById);
  for (let i = 0; i < keys.length; i++) {
    const taskflow = tfMapById[keys[i]];
    if (!taskflow.meta) {
      dispatch(TaskflowActions.fetchTaskflow(taskflow.flow._id));
    }
  }
}

export function updateClusterStatus(id, status) {
  // for taskflows on ec2 the meta object is not as readily available
  // this is due to fewer jobs coming through SSE which triggers a fetch for trad clusters.
  updateTaskflowActionsForClusterEvent(store.getState().preferences.clusters.mapById[id], status);
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
      // Wait 10 seconds if the browser hasn't reconnected then reinitialize.
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

export function fetchCluster(id) {
  return dispatch => {
    const action = netActions.addNetworkCall('fetch_cluster', 'Retreive cluster');
    dispatch(pendingNetworkCall(true));
    client.getCluster(id)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(addExistingCluster(resp.data));
          dispatch(pendingNetworkCall(false));
        },
        err => {
          dispatch(netActions.errorNetworkCall(action.id, err));
          dispatch(pendingNetworkCall(false));
        });

    return action;
  };
}

export function fetchClusters(type) {
  return dispatch => {
    const action = netActions.addNetworkCall('fetch_clusters', 'Retreive clusters');
    dispatch(pendingNetworkCall(true));
    client.listClusters(type)
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

// removes a cluster from the preferences page and deletes it if has _id
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

// deletes a cluster by id, different from removeCluster(index, cluster) above
export function deleteCluster(id) {
  return dispatch => {
    const action = netActions.addNetworkCall('delete_cluster', 'Delete cluster');

    dispatch(pendingNetworkCall(true));
    client.deleteCluster(id)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(pendingNetworkCall(false));
          dispatch(removeClusterById(id));
        },
        err => {
          dispatch(netActions.errorNetworkCall(action.id, err));
          dispatch(pendingNetworkCall(false));
        });

    return action;
  };
}

export function saveCluster(index, cluster, pushToServer = false) {
  const saveAction = { type: SAVE_CLUSTER, index, cluster };
  if (pushToServer) {
    const action = netActions.addNetworkCall('save_cluster', 'Save cluster');
    dispatch(pendingNetworkCall(true));
    ClusterHelper.saveCluster(cluster)
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
}

export function updateCluster(cluster) {
  return dispatch => {
    const action = netActions.addNetworkCall('save_cluster', 'Save cluster');
    client.updateCluster(cluster)
      .then((resp) => {
        dispatch(updateExistingCluster(resp.data));
        dispatch(pendingNetworkCall(false));
        dispatch(netActions.successNetworkCall(action.id, resp));
      })
      .catch((err) => {
        console.log(err);
        dispatch(netActions.errorNetworkCall(action.id, err));
        dispatch(pendingNetworkCall(false));
      });
    return action;
  };
}

export function testCluster(index, cluster) {
  if (!cluster._id) {
    return { type: 'NOOP', message: 'Cluster is not available on server yet' };
  }
  return dispatch => {
    const action = netActions.addNetworkCall('test_cluster', 'Test cluster');
    dispatch(pendingNetworkCall(true));
    dispatch({ type: TESTING_CLUSTER, index });
    return client.testCluster(cluster._id)
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
  if (!authenticated) {
    dispatch(updateClusters([]));
  }
});
