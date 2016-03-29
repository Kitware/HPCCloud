import * as netActions  from './network';
import client           from '../../network';
import { dispatch }     from '..';

export const UPDATE_ACTIVE_TYPE = 'UPDATE_ACTIVE_TYPE';
export const UPDATE_STATUS_LIST = 'UPDATE_STATUS_LIST';
export const PENDING_CLUSTER_NETWORK = 'PENDING_CLUSTER_NETWORK';

export function updateActiveType(index) {
  return { type: UPDATE_ACTIVE_TYPE, index };
}

export function updateStatusList(list) {
  return { type: UPDATE_STATUS_LIST, list };
}

export function pendingNetworkCall(pending = true) {
  return { type: PENDING_CLUSTER_NETWORK, pending };
}

export function fetchServers() {
  return (dispatch) => {
    const action = netActions.addNetworkCall('fetch_servers', 'Retreive servers');

    dispatch(pendingNetworkCall(true));
    client.listClusterProfiles()
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(updateStatusList(resp.data));
          dispatch(pendingNetworkCall(false));
          dispatch(netActions.successNetworkCall(action.id, resp));
        },
        err => {
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
