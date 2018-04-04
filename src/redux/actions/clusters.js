import * as netActions from './network';
import * as TaskflowActions from './taskflows';
import client from '../../network';
import * as ClusterHelper from '../../network/helpers/clusters';
import { store, dispatch } from '..';

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
export const APPEND_TO_CLUSTER_LOG = 'APPEND_TO_CLUSTER_LOG';
export const RESTRICTED_CLUSTER_LOG = 'RESTRICTED_CLUSTER_LOG';

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

export function updateClusters(clusters) {
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

export function appendToClusterLog(id, logEntry) {
  return { type: APPEND_TO_CLUSTER_LOG, id, logEntry };
}

export function restrictedClusterLog(id) {
  return { type: RESTRICTED_CLUSTER_LOG, id };
}

function updateTaskflowActionsForClusterEvent(cluster, status) {
  if (cluster.type !== 'ec2') {
    return;
  }
  const tfMapById = Object.assign({}, store.getState().taskflows.mapById);
  const keys = Object.keys(tfMapById);
  for (let i = 0; i < keys.length; i++) {
    const taskflow = tfMapById[keys[i]];
    if (!taskflow.flow.meta) {
      dispatch(TaskflowActions.fetchTaskflow(taskflow.flow._id));
    } else {
      dispatch(TaskflowActions.triggerUpdate(taskflow.flow._id));
    }
  }
}

export function updateClusterStatus(id, status) {
  // for taskflows on ec2 the meta object is not as readily available
  // this is due to fewer jobs coming through SSE which triggers a fetch for trad clusters.
  updateTaskflowActionsForClusterEvent(
    store.getState().preferences.clusters.mapById[id],
    status
  );
  return { type: UPDATE_CLUSTER_STATUS, id, status };
}

export function getClusterLog(id, offset) {
  return (dispatch) => {
    const action = netActions.addNetworkCall(
      `cluster_log_${id}`,
      'Check cluster log'
    );
    client
      .getClusterLog(id, offset)
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        if (!offset) {
          // offset is 0 or undefined
          dispatch(updateClusterLog(id, resp.data.log));
        } else {
          dispatch(appendToClusterLog(id, resp.data.log));
        }
      })
      .catch((error) => {
        dispatch(netActions.errorNetworkCall(action.id, error));
      });
    return action;
  };
}

export function fetchCluster(id, taskflowIdToUpdate = '') {
  return (dispatch) => {
    const action = netActions.addNetworkCall(
      'fetch_cluster',
      'Retreive cluster'
    );
    client.getCluster(id).then(
      (resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(addExistingCluster(resp.data));
        if (taskflowIdToUpdate.length) {
          dispatch(TaskflowActions.triggerUpdate(taskflowIdToUpdate));
        }
      },
      (err) => {
        dispatch(netActions.errorNetworkCall(action.id, err));
      }
    );

    return action;
  };
}

export function fetchClusters(type) {
  // this can be called excessively from a log or status event, this acts as our debounce
  if (store.getState().preferences.clusters.pending) {
    return { type: 'NOOP' };
  }
  return (dispatch) => {
    const action = netActions.addNetworkCall(
      'fetch_clusters',
      'Retreive clusters'
    );
    dispatch(pendingNetworkCall(true));
    client.listClusters(type).then(
      (resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateClusters(resp.data));
        dispatch(pendingNetworkCall(false));
      },
      (err) => {
        dispatch(netActions.errorNetworkCall(action.id, err));
        dispatch(pendingNetworkCall(false));
      }
    );

    return action;
  };
}

export function fetchClusterPresets() {
  return (dispatch) => {
    const action = netActions.addNetworkCall(
      'fetch_cluster_presets',
      'Retreive cluster presets'
    );
    client.getClusterPresets().then(
      (presets) => {
        dispatch(netActions.successNetworkCall(action.id, presets));
        dispatch(updateClusterPresets(presets.data));
      },
      (error) => {
        dispatch(netActions.errorNetworkCall(action.id, error));
      }
    );

    return action;
  };
}

// removes a cluster from the preferences page and deletes it if has _id
export function removeCluster(index, cluster) {
  if (!cluster || !cluster._id) {
    return { type: REMOVE_CLUSTER, index };
  }

  return (dispatch) => {
    const action = netActions.addNetworkCall(
      'remove_cluster',
      'Remove cluster'
    );

    client.deleteCluster(cluster._id).then(
      (resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(fetchClusters());
      },
      (err) => {
        dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
      }
    );

    return action;
  };
}

// deletes a cluster by id, different from removeCluster(index, cluster) above
export function deleteCluster(id) {
  return (dispatch) => {
    const action = netActions.addNetworkCall(
      'delete_cluster',
      'Delete cluster'
    );

    client.deleteCluster(id).then(
      (resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(removeClusterById(id));
      },
      (err) => {
        dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
      }
    );

    return action;
  };
}

export function saveCluster(index, cluster, pushToServer = false) {
  const saveAction = { type: SAVE_CLUSTER, index, cluster };
  if (pushToServer) {
    const action = netActions.addNetworkCall('save_cluster', 'Save cluster');
    ClusterHelper.saveCluster(cluster).then(
      (resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
      },
      (err) => {
        dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
      }
    );
  }
  return saveAction;
}

export function updateCluster(cluster) {
  return (dispatch) => {
    const action = netActions.addNetworkCall('save_cluster', 'Save cluster');
    client
      .updateCluster(cluster)
      .then((resp) => {
        dispatch(updateExistingCluster(resp.data));
        dispatch(netActions.successNetworkCall(action.id, resp));
      })
      .catch((err) => {
        console.log(err);
        dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
      });
    return action;
  };
}

export function testCluster(index, cluster) {
  if (!cluster._id) {
    return { type: 'NOOP', message: 'Cluster is not available on server yet' };
  }
  return (dispatch) => {
    const action = netActions.addNetworkCall('test_cluster', 'Test cluster');
    dispatch({ type: TESTING_CLUSTER, index });
    client.testCluster(cluster._id).then(
      (resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
      },
      (error) => {
        dispatch(netActions.errorNetworkCall(action.id, error, 'form'));
      }
    );
    return action;
  };
}

export function terminateCluster(id) {
  return (dispatch) => {
    const action = netActions.addNetworkCall(
      `terminate_cluster_${id}`,
      'terminate cluster'
    );
    client
      .terminateCluster(id)
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
      })
      .catch((err) => {
        dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
      });
    return action;
  };
}

// Auto trigger actions on authentication change...
client.onAuthChange((authenticated) => {
  if (!authenticated) {
    dispatch(updateClusters([]));
    dispatch(updateClusterPresets({}));
  }
});
