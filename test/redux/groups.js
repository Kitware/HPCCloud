import * as Actions from '../../src/redux/actions/groups';
import groupsReducer, {
  groupTemplate,
  initialState,
} from '../../src/redux/reducers/groups';
import client from '../../src/network';

import { registerAssertions } from 'redux-actions-assertions/jasmine';
import deepClone from 'mout/src/lang/deepClone';
/* global jasmine describe expect it beforeEach spyOn */

function setSpy(target, method, data) {
  spyOn(target, method).and.returnValue(Promise.resolve({ data }));
}

Object.freeze(initialState);

describe('group actions', () => {
  beforeEach(registerAssertions);

  const groupUsers = [
    { _id: 'abc', name: 'Alice' },
    { _id: 'def', name: 'Jake' },
  ];
  const groups = [
    { _id: 'abc', name: 'group1' },
    { _id: 'def', name: 'group2' },
  ];
  const someGroup = { _id: '123', name: 'some group' };

  describe('simple actions', () => {
    it('lists new users', (done) => {
      const expectedAction = {
        type: Actions.LIST_USERS,
        groupId: '123',
        users: groupUsers,
      };
      expect(Actions.listUsers('123', groupUsers)).toDispatchActions(
        expectedAction,
        done
      );

      const newState = deepClone(initialState);
      newState.usersByGroup = { 123: groupUsers };
      expect(groupsReducer(initialState, expectedAction)).toEqual(newState);
    });

    it('adds group', (done) => {
      const expectedAction = { type: Actions.ADD_GROUP };
      expect(Actions.addGroup()).toDispatchActions(expectedAction, done);

      const newState = deepClone(initialState);
      const newGroup = deepClone(groupTemplate);
      newGroup.name = 'new group 0';
      newState.list = [newGroup];
      newState.active = 0;
      expect(groupsReducer(initialState, expectedAction)).toEqual(newState);
    });

    it('updates local group', (done) => {
      const thisGroup = deepClone(someGroup);
      const expectedAction = {
        type: Actions.SAVE_GROUP,
        index: 0,
        group: thisGroup,
      };
      expect(Actions.updateLocalGroup(0, someGroup)).toDispatchActions(
        expectedAction,
        done
      );

      const newState = deepClone(initialState);
      newState.list = [thisGroup];
      newState.active = 0;
      newState.mapById[thisGroup._id] = thisGroup;
      expect(groupsReducer(initialState, expectedAction)).toEqual(
        newState,
        done
      );

      // should be able to update item without an id
      delete thisGroup._id;
      newState.mapById = {};
      expect(groupsReducer(initialState, expectedAction)).toEqual(
        newState,
        done
      );
    });

    it('updates the active group in a list', (done) => {
      const index = 1;
      const expectedAction = { type: Actions.UPDATE_ACTIVE_GROUP, index };
      expect(Actions.updateActiveGroup(index)).toDispatchActions(
        expectedAction,
        done
      );

      expect(
        groupsReducer(deepClone(initialState), expectedAction).active
      ).toEqual(index);
    });
  });

  describe('async actions', () => {
    it('creates a group', (done) => {
      setSpy(client, 'createGroup', someGroup);
      const expectedAction = {
        type: Actions.SAVE_GROUP,
        index: 0,
        group: someGroup,
      };
      expect(Actions.saveGroup(0, someGroup)).toDispatchActions(
        expectedAction,
        done
      );
    });

    it('fetches groups', (done) => {
      const accessResponse = {
        _id: 'abc',
        name: 'group1',
        access: { users: groupUsers },
      };
      setSpy(client, 'getGroups', groups);
      setSpy(client, 'getGroupAccess', accessResponse);
      const expectedActions = [
        { type: Actions.GET_GROUPS, groups },
        { type: Actions.LIST_USERS, groupId: 'abc', users: groupUsers },
      ];

      expect(Actions.getGroups()).toDispatchActions(expectedActions, done);
      expect(client.getGroups).toHaveBeenCalled();
    });

    it('updates a remote group', (done) => {
      jasmine.clock().install();
      setSpy(client, 'editGroup', someGroup);
      const expectedAction = {
        type: Actions.SAVE_GROUP,
        index: 0,
        group: someGroup,
      };
      // several "edits"
      Actions.updateGroup(0, someGroup);
      Actions.updateGroup(0, someGroup);
      Actions.updateGroup(0, someGroup);
      expect(Actions.updateGroup(0, someGroup)).toDispatchActions(
        expectedAction,
        done
      );

      // should only be updated remotely once
      expect(client.editGroup).not.toHaveBeenCalled();
      jasmine.clock().tick(800);
      expect(client.editGroup.calls.count()).toEqual(1);
      expect(client.editGroup).toHaveBeenCalledWith(someGroup);
      jasmine.clock().uninstall();
    });

    it('adds users to a group', (done) => {
      setSpy(client, 'addGroupInvitation', someGroup);
      expect(Actions.addToGroup('123', 'abc')).toDispatchActions([], done);
      expect(client.addGroupInvitation.calls.count()).toEqual(1);
      expect(client.addGroupInvitation).toHaveBeenCalledWith('123', {
        userId: 'abc',
        level: 2,
        force: true,
      });

      expect(
        Actions.addToGroup('123', ['abc', 'def', 'ghi'])
      ).toDispatchActions([], done);
      expect(client.addGroupInvitation.calls.count()).toEqual(4);
    });

    it('removes users from a group', (done) => {
      setSpy(client, 'removeUserFromGroup', null);
      expect(Actions.removeFromGroup('123', 'abc')).toDispatchActions([], done);
      expect(client.removeUserFromGroup.calls.count()).toEqual(1);

      expect(
        Actions.removeFromGroup('123', ['abc', 'def', 'ghi'])
      ).toDispatchActions([], done);
      expect(client.removeUserFromGroup.calls.count()).toEqual(4);
    });

    it('deletes a group', (done) => {
      setSpy(client, 'deleteGroup', null);
      const expectedActions = {
        type: Actions.REMOVE_GROUP,
        group: someGroup,
        index: 0,
      };
      expect(Actions.deleteGroup(0, someGroup)).toDispatchActions(
        expectedActions,
        done
      );
      expect(client.deleteGroup).toHaveBeenCalled();
    });
  });
});
