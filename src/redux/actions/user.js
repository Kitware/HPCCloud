import client from '../../network';
import * as netActions from './network';
import * as routingActions from './router';
import store from '..';

export const LOGGED_IN = 'LOGGED_IN';
export const AUTH_PENDING = 'AUTH_PENDING';
export const LOGOUT = 'LOGOUT';

/* eslint-disable no-shadow */

export function authenticationPending(pending = true) {
  return {
    type: AUTH_PENDING,
    pending,
  };
}

export function loggedIn(user) {
  return {
    type: LOGGED_IN,
    user,
  };
}

export function register(firstName, lastName, login, email, password) {
  return dispatch => {
    const action = netActions.addNetworkCall('user_register', 'Register user');

    client.registerUser({ firstName, lastName, login, email, password })
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(routingActions.replace('/Login'));
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function login(username, password) {
  return dispatch => {
    dispatch(authenticationPending(true));
    const action = netActions.addNetworkCall('user_login', 'Authenticate');

    client.login(username, password)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(authenticationPending(false));
          dispatch(loggedIn(client.getUser()));
          dispatch(routingActions.replace('/'));
        },
        err => {
          dispatch(netActions.errorNetworkCall(action.id, err));
          dispatch(authenticationPending(false));
        });

    return action;
  };
}

export function logout() {
  return dispatch => {
    dispatch(authenticationPending(false));
    const action = netActions.addNetworkCall('user_logout', 'Logout');

    client.logout()
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(routingActions.replace('/'));
        },
        err => {
          dispatch(netActions.errorNetworkCall(action.id, err));
          dispatch(routingActions.replace('/'));
        });

    return action;
  };
}


export function forgetPassword(email) {
  return dispatch => {
    const action = netActions.addNetworkCall('user_forget', 'Forget password');

    client.resetPassword(email)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
        },
        err => {
          dispatch(netActions.errorNetworkCall(action.id, err));
        });

    return action;
  };
}

export function changePassword(oldPassword, newPassword) {
  return dispatch => {
    const action = netActions.addNetworkCall('user_updatePassword', 'Update password');

    client.changePassword(oldPassword, newPassword)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
        },
        err => {
          dispatch(netActions.errorNetworkCall(action.id, err));
        });

    return action;
  };
}

// Auto trigger actions on authentication change...
client.onAuthChange(authenticated => {
  if (authenticated) {
    store.dispatch(loggedIn(client.getUser()));
  } else {
    store.dispatch({ type: LOGOUT });
  }
});
