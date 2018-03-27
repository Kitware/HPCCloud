import client from '../../network';
import * as netActions from './network';
import { dispatch, history } from '..';

export const LOGGED_IN = 'LOGGED_IN';
export const AUTH_PENDING = 'AUTH_PENDING';
export const LOGOUT = 'LOGOUT';
export const GET_USERS = 'GET_USERS';

/* eslint-disable no-shadow */
export function authenticationPending(pending = true) {
  return { type: AUTH_PENDING, pending };
}

export function loggedIn(user) {
  return { type: LOGGED_IN, user };
}

export function login(username, password) {
  return (dispatch) => {
    dispatch(authenticationPending(true));
    const action = netActions.addNetworkCall('user_login', 'Authenticate');

    client
      .login(username, password)
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(authenticationPending(false));
        dispatch(loggedIn(client.getLoggedInUser()));
        history.replace('/');
      })
      .catch((err) => {
        dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
        dispatch(authenticationPending(false));
      });

    return action;
  };
}

export function register(firstName, lastName, login, email, password) {
  return (dispatch) => {
    const action = netActions.addNetworkCall('user_register', 'Register user');

    client
      .createUser({ firstName, lastName, login, email, password, admin: false })
      .then(
        (resp) => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          history.replace('/Login');
        },
        (error) => {
          dispatch(netActions.errorNetworkCall(action.id, error, 'form'));
        }
      );

    return action;
  };
}

export function logout() {
  return (dispatch) => {
    dispatch(authenticationPending(false));
    const action = netActions.addNetworkCall('user_logout', 'Logout');

    client.logout().then(
      (resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        history.replace('/');
      },
      (err) => {
        dispatch(netActions.errorNetworkCall(action.id, err));
        history.replace('/');
      }
    );

    return action;
  };
}

export function forgetPassword(email) {
  return (dispatch) => {
    const action = netActions.addNetworkCall('user_forget', 'Forget password');

    client.resetPassword(email).then(
      (resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
      },
      (err) => {
        dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
      }
    );

    return action;
  };
}

export function changePassword(oldPassword, newPassword) {
  return (dispatch) => {
    const action = netActions.addNetworkCall(
      'user_updatePassword',
      'Update password'
    );

    client.changePassword(oldPassword, newPassword).then(
      (resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
      },
      (err) => {
        dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
      }
    );

    return action;
  };
}

export function updateUser(user, pushOnServer = false) {
  return (dispatch) => {
    if (pushOnServer) {
      const action = netActions.addNetworkCall(
        'user_update',
        'Update user informations'
      );
      const { _id, firstName, lastName, email } = user;

      client.updateUser({ _id, firstName, lastName, email }).then(
        (resp) => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(loggedIn(resp.data));
        },
        (err) => {
          dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
        }
      );

      return action;
    }
    return loggedIn(user);
  };
}

export function getUsers() {
  return (dispatch) => {
    const action = netActions.addNetworkCall(
      'user_updatePassword',
      'Update password'
    );

    client
      .listUsers()
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch({ type: GET_USERS, users: resp.data });
      })
      .catch((err) => {
        dispatch(netActions.errorNetworkCall(action.id, err));
      });
    return action;
  };
}

// Auto trigger actions on authentication change...
client.onAuthChange((authenticated) => {
  if (authenticated) {
    dispatch(loggedIn(client.getLoggedInUser()));
  } else {
    dispatch({ type: LOGOUT });
  }
});
