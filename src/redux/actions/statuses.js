import * as netActions  from './network';
import client           from '../../network';
import { dispatch }     from '..';

export const UPDATE_CLUSTERS_LIST = 'UPDATE_CLUSTERS_LIST';
export const UPDATE_EC2_LIST = 'UPDATE_EC2_LIST';
export const PENDING_CLUSTER_NETWORK = 'PENDING_CLUSTER_NETWORK';

/* eslint-disable no-shadow */

export function updateClusterList(list) {
  return { type: UPDATE_CLUSTERS_LIST, list };
}

export function updateEC2List(list) {
  return { type: UPDATE_EC2_LIST, list };
}

export function pendingNetworkCall(pending = true) {
  return { type: PENDING_CLUSTER_NETWORK, pending };
}

export function fetchServers() {
  return (dispatch) => {
    const action = netActions.addNetworkCall('fetch_servers', 'Retreive servers');

    dispatch(pendingNetworkCall(true));
    client.listClusterProfiles()
      .then(resp => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateClusterList(resp.data));
        return client.listAWSProfiles();
      })
      .then(resp => {
        dispatch(updateEC2List(resp.data));
        dispatch(pendingNetworkCall(false));
        dispatch(netActions.successNetworkCall(action.id, resp));
      })
      .catch(err => {
        dispatch(netActions.errorNetworkCall(action.id, err));
        dispatch(pendingNetworkCall(false));
      });

    return action;
  };
}

// client.onEvent((e) => {
//   if (e.type === 'cluster.status') {
//     dispatch(fetchClusters());
//   }
// });

// No need to be authenticated
setImmediate(() => {
  dispatch(fetchServers());
});

// Auto trigger actions on authentication change...
client.onAuthChange(authenticated => {
  if (authenticated) {
    dispatch(fetchServers());
  }
});
