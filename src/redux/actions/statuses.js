import * as netActions from './network';
import client from '../../network';

export const UPDATE_CLUSTERS_LIST = 'UPDATE_CLUSTERS_LIST';
export const UPDATE_EC2_LIST = 'UPDATE_EC2_LIST';
export const PENDING_CLUSTER_NETWORK = 'PENDING_CLUSTER_NETWORK';

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
    const action = netActions.addNetworkCall(
      'fetch_servers',
      'Retreive servers'
    );

    dispatch(pendingNetworkCall(true));
    client
      .listClusters()
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateClusterList(resp.data));
        return client.listAWSProfiles();
      })
      .then((resp) => {
        dispatch(updateEC2List(resp.data));
        dispatch(pendingNetworkCall(false));
        dispatch(netActions.successNetworkCall(action.id, resp));
      })
      .catch((err) => {
        dispatch(netActions.errorNetworkCall(action.id, err));
        dispatch(pendingNetworkCall(false));
      });

    return action;
  };
}
