import client           from '../../network';
import * as netActions  from './network';
import { dispatch }     from '..';

export const ADD_AWS_PROFILE = 'ADD_AWS_PROFILE';
export const UPDATE_AWS_PROFILES = 'UPDATE_AWS_PROFILES';
export const UPDATE_ACTIVE_AWS_PROFILE = 'UPDATE_ACTIVE_AWS_PROFILE';
export const PENDING_AWS_NETWORK = 'PENDING_AWS_NETWORK';
export const REMOVE_AWS_PROFILE = 'REMOVE_AWS_PROFILE';
export const SAVE_AWS_PROFILE = 'SAVE_AWS_PROFILE';

/* eslint-disable no-shadow */

export function addAWSProfile() {
  return { type: ADD_AWS_PROFILE };
}

export function updateActiveProfile(index) {
  return { type: UPDATE_ACTIVE_AWS_PROFILE, index };
}

export function pendingNetworkCall(pending = false) {
  return { type: PENDING_AWS_NETWORK, pending };
}

export function updateAWSProfiles(profiles) {
  return { type: UPDATE_AWS_PROFILES, profiles };
}

export function fetchAWSProfiles() {
  return dispatch => {
    const action = netActions.addNetworkCall('fetch_aws_profiles', 'Retreive AWS profiles');
    dispatch(pendingNetworkCall(true));
    client.listAWSProfiles()
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateAWSProfiles(resp.data));
        dispatch(pendingNetworkCall(false));
      })
      .catch((error) => {
        dispatch(netActions.errorNetworkCall(action.id, error));
        dispatch(pendingNetworkCall(false));
      });

    return action;
  };
}

export function removeAWSProfile(index, profile) {
  if (!profile._id) {
    return { type: REMOVE_AWS_PROFILE, index };
  }

  return dispatch => {
    const action = netActions.addNetworkCall('remove_aws_profile', 'Remove cluster');

    dispatch(pendingNetworkCall(true));
    client.deleteAWSProfile(profile._id)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(pendingNetworkCall(false));
          dispatch(fetchAWSProfiles());
        },
        err => {
          dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
          dispatch(pendingNetworkCall(false));
        });

    return action;
  };
}

export function updateAWSProfile(index, profile, pushToServer = false) {
  if (!pushToServer) {
    return { type: SAVE_AWS_PROFILE, index, profile };
  }
  return dispatch => {
    const action = netActions.addNetworkCall('save_aws_profile', 'Save cluster');
    dispatch(pendingNetworkCall(true));
    client.createAWSProfile(profile)
      .then(
        resp => {
          dispatch(pendingNetworkCall(false));
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(fetchAWSProfiles());
        },
        err => {
          dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
          dispatch(pendingNetworkCall(false));
        });
    return action;
  };
}

// Auto trigger actions on authentication change...
client.onAuthChange(authenticated => {
  if (!authenticated) {
    dispatch(updateAWSProfiles([]));
  }
});
