import * as netActions  from './network';
import client           from '../../network';
import { dispatch }     from '..';

export const ADD_VOLUME = 'ADD_VOLUME';
export const UPDATE_ACTIVE_VOLUME = 'UPDATE_ACTIVE_VOLUME';
export const REMOVE_VOLUME = 'REMOVE_VOLUME';
export const UPDATE_VOLUMES = 'UPDATE_VOLUMES';
export const UPDATE_VOLUME = 'UPDATE_VOLUME';
export const UPDATE_VOLUME_LOG = 'UPDATE_VOLUME';
export const APPEND_TO_VOLUME_LOG = 'APPEND_TO_VOLUME_LOG';
export const UPDATE_VOLUME_STATUS = 'UPDATE_VOLUME_STATUS';
export const SAVE_VOLUME = 'SAVE_VOLUME';
export const PENDING_VOLUME_NETWORK = 'PENDING_VOLUME_NETWORK';

/* eslint-disable no-shadow */

export function addVolume(profileId) {
  return { type: ADD_VOLUME, profileId };
}

export function updateActiveVolume(active) {
  return { type: UPDATE_ACTIVE_VOLUME, active };
}

export function pendingNetworkCall(pending = false) {
  return { type: PENDING_VOLUME_NETWORK, pending };
}

export function updateVolumes(volumes) {
  return { type: UPDATE_VOLUMES, volumes };
}

export function updateVolumeStatus(volumeId, status) {
  return { type: UPDATE_VOLUME_STATUS, volumeId, status };
}

export function updateVolumeLog(id, log) {
  return { type: UPDATE_VOLUME_LOG, id, log };
}

export function appendToVolumeLog(id, logEntry) {
  return { type: APPEND_TO_VOLUME_LOG, id, logEntry };
}

export function fetchVolumes() {
  return dispatch => {
    const action = netActions.addNetworkCall('fetch_volumes', 'Retreive EBS Volumes');
    dispatch(pendingNetworkCall(true));
    client.listVolumes()
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateVolumes(resp.data));
        dispatch(pendingNetworkCall(false));
      })
      .catch((error) => {
        dispatch(netActions.errorNetworkCall(action.id, error));
        dispatch(pendingNetworkCall(false));
      });

    return action;
  };
}

export function removeVolume(index, volume) {
  if (!volume._id) {
    return { type: REMOVE_VOLUME, index };
  }

  return dispatch => {
    const action = netActions.addNetworkCall('remove_volume', 'Remove volume');

    dispatch(pendingNetworkCall(true));
    client.deleteVolume(volume._id)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(pendingNetworkCall(false));
          dispatch(fetchVolumes());
        },
        err => {
          dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
          dispatch(pendingNetworkCall(false));
        });

    return action;
  };
}

export function updateVolume(index, volume, pushToServer = false) {
  if (!pushToServer) {
    return { type: SAVE_VOLUME, index, volume };
  }
  return dispatch => {
    const action = netActions.addNetworkCall('save_volume', 'Save volume');
    dispatch(pendingNetworkCall(true));
    client.createVolume(volume)
      .then(
        resp => {
          dispatch(pendingNetworkCall(false));
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(fetchVolumes());
        },
        err => {
          dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
          dispatch(pendingNetworkCall(false));
        });
    return action;
  };
}

export function getVolumeLog(id, offset) {
  return (dispatch) => {
    const action = netActions.addNetworkCall(`cluster_log_${id}`, 'Check cluster log');
    client.getVolumeLog(id, offset)
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        if (!offset) { // offset is 0 or undefined
          dispatch(updateVolumeLog(id, resp.data.log));
        } else {
          dispatch(appendToVolumeLog(id, resp.data.log));
        }
      })
      .catch((error) => {
        dispatch(netActions.errorNetworkCall(action.id, error));
      });
    return action;
  };
}

// export function attachVolume(volumeId, clusterId) {
//   return dispatch => {
//     const action = netActions.addNetworkCall('attach_volume', 'attach volume');
//     dispatch(pendingNetworkCall(true));
//     client.attachVolume(volumeId, clusterId)
//       .then(
//         resp => {
//           dispatch(pendingNetworkCall(false));
//           dispatch(netActions.successNetworkCall(action.id, resp));
//         },
//         err => {
//           dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
//           dispatch(pendingNetworkCall(false));
//         });
//     return action;
//   };
// }

// Auto trigger actions on authentication change...
client.onAuthChange(authenticated => {
  if (!authenticated) {
    dispatch(updateVolumes([]));
  }
});
