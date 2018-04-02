import * as Actions from '../../src/redux/actions/statuses';
import statusesReducer, {
  initialState,
} from '../../src/redux/reducers/statuses';
import client from '../../src/network';

import expect from 'expect';
import thunk from 'redux-thunk';
import complete from '../helpers/complete';
import { registerMiddlewares } from 'redux-actions-assertions';
import { registerAssertions } from 'redux-actions-assertions/expect';
/* global describe it afterEach */

registerMiddlewares([thunk]);
registerAssertions();

Object.freeze(initialState);

function setSpy(target, method, data) {
  expect.spyOn(target, method).andReturn(Promise.resolve({ data }));
}

describe('status', () => {
  const list = [{ _id: 'a1' }, { _id: 'b2' }];
  describe('simple actions', () => {
    it('should update cluster list', (done) => {
      const expectedAction = { type: Actions.UPDATE_CLUSTERS_LIST, list };
      expect(Actions.updateClusterList(list)).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const expectedState = Object.assign({}, initialState);
      expectedState.clusters = list;
      expect(statusesReducer(initialState, expectedAction)).toEqual(
        expectedState
      );
    });

    it('should update ec2 list', (done) => {
      const expectedAction = { type: Actions.UPDATE_EC2_LIST, list };
      expect(Actions.updateEC2List(list)).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const expectedState = Object.assign({}, initialState);
      expectedState.ec2 = list;
      expect(statusesReducer(initialState, expectedAction)).toEqual(
        expectedState
      );
    });
  });

  describe('async action', () => {
    afterEach(() => {
      expect.restoreSpies();
    });

    it('should fetch servers', (done) => {
      const expectedActions = [
        { type: Actions.UPDATE_EC2_LIST, list },
        { type: Actions.UPDATE_CLUSTERS_LIST, list },
      ];
      setSpy(client, 'listClusters', list);
      setSpy(client, 'listAWSProfiles', list);
      expect(Actions.fetchServers()).toDispatchActions(
        expectedActions,
        complete(done)
      );
    });
  });
});
