import client from '../../network';
import * as netActions from './network';
import { dispatch } from '..';

export const PENDING_GROUP_NETWORK = 'PENDING_GROUP_NETWORK';
export const GET_GROUPS = 'GET_GROUPS';
export const ADD_GROUP = 'ADD_GROUP';
export const SAVE_GROUP = 'SAVE_GROUP';
export const REMOVE_GROUP = 'REMOVE_GROUP';
export const DELETE_GROUP = 'DELETE_GROUP';
export const UPDATE_ACTIVE_GROUP = 'UPDATE_ACTIVE_GROUP';
export const UPDATE_USER_LIST = 'UPDATE_USER_LIST';
export const LIST_USERS = 'LIST_USERS';

/* eslint-disable no-shadow */

export function listUsers(groupId, users) {
  return { type: LIST_USERS, groupId, users };
}

function removeGroup(index, group) {
  return { type: REMOVE_GROUP, group, index };
}

export function getGroupUsers(id) {
  const action = netActions.addNetworkCall(
    'group_access',
    `List group access ${id}`
  );
  return (dispatch) => {
    client
      .getGroupAccess(id)
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(listUsers(id, resp.data.access.users));
      })
      .catch((err) => {
        dispatch(netActions.errorNetworkCall(action.id, err));
      });
    return action;
  };
}

export function updateActiveGroup(index) {
  return { type: UPDATE_ACTIVE_GROUP, index };
}

export function pendingNetworkCall(pending = true) {
  return { type: PENDING_GROUP_NETWORK, pending };
}

export function getGroups() {
  return (dispatch) => {
    const action = netActions.addNetworkCall('get_groups', 'get groups');
    dispatch(pendingNetworkCall(true));
    client.getGroups().then(
      (resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch({ type: GET_GROUPS, groups: resp.data });
        if (resp.data.length) {
          dispatch(getGroupUsers(resp.data[0]._id));
        }
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

export function addGroup() {
  return { type: ADD_GROUP };
}

export function updateLocalGroup(index, group) {
  return { type: SAVE_GROUP, index, group };
}

export function saveGroup(index, group) {
  return (dispatch) => {
    const action = netActions.addNetworkCall('save_group', 'Save group');
    client.createGroup(group).then(
      (resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateLocalGroup(index, resp.data));
        dispatch(getGroupUsers(resp.data._id));
      },
      (err) => {
        dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
      }
    );
    return action;
  };
}

let debounce = null;

function pushGroup(index, group) {
  const action = netActions.addNetworkCall('edit_group', 'Edit group');
  client
    .editGroup(group)
    .then((resp) => {
      dispatch(netActions.successNetworkCall(action.id, resp));
    })
    .catch((err) => {
      dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
    });
}

export function updateGroup(index, group) {
  if (debounce) {
    clearTimeout(debounce);
    debounce = null;
  }

  if (group._id) {
    debounce = setTimeout(() => pushGroup(index, group), 700);
  }

  return updateLocalGroup(index, group);
}

export function deleteGroup(index, group) {
  if (!group || !group._id) {
    return { type: REMOVE_GROUP, index, group };
  }

  return (dispatch) => {
    const action = netActions.addNetworkCall('delete_group', 'Delete group');
    client
      .deleteGroup(group._id)
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(removeGroup(index, group));
      })
      .catch((err) => {
        dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
      });
    return action;
  };
}

export function addToGroup(groupId, userId) {
  return (dispatch) => {
    const action = netActions.addNetworkCall(
      'add_to_group',
      'Add user(s) to group'
    );
    const addPromises = [];
    if (Array.isArray(userId) && userId.length) {
      userId.forEach((id) => {
        addPromises.push(
          client.addGroupInvitation(groupId, {
            userId: id,
            level: 2,
            force: true,
          })
        );
      });
    } else {
      addPromises.push(
        client.addGroupInvitation(groupId, { userId, level: 2, force: true })
      );
    }
    Promise.all(addPromises)
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(getGroupUsers(groupId));
      })
      .catch((err) => {
        dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
      });
    return action;
  };
}

export function removeFromGroup(groupId, userId) {
  return (dispatch) => {
    const action = netActions.addNetworkCall(
      'remove_from_group',
      'Remove user(s) from group'
    );
    const removePromises = [];
    if (Array.isArray(userId) && userId.length) {
      userId.forEach((id) => {
        removePromises.push(client.removeUserFromGroup(groupId, id));
      });
    } else {
      removePromises.push(client.removeUserFromGroup(groupId, userId));
    }
    Promise.all(removePromises)
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(getGroupUsers(groupId));
      })
      .catch((err) => {
        dispatch(netActions.errorNetworkCall(action.id, err, 'form'));
      });
    return action;
  };
}
