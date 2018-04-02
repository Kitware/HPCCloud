import expect, { spyOn } from 'expect';
import thunk from 'redux-thunk';
import { registerMiddlewares } from 'redux-actions-assertions';
import { registerAssertions } from 'redux-actions-assertions/expect';
import deepClone from 'mout/src/lang/deepClone';

import * as Actions from '../../src/redux/actions/aws';
import awsReducer, {
  awsTemplate,
  initialState,
} from '../../src/redux/reducers/aws';
import client from '../../src/network';

import awsState from '../sampleData/awsState';

import complete from '../helpers/complete';

/* global describe it afterEach */

registerMiddlewares([thunk]);
registerAssertions();

function setSpy(target, method, data) {
  spyOn(target, method).andReturn(Promise.resolve({ data }));
}

describe('aws', () => {
  const profiles = [{ _id: 'a1' }, { _id: 'b2' }];
  const profile = Object.assign({}, awsState.list[0]);
  describe('simple actions', () => {
    it('should add aws profile', (done) => {
      const expectedAction = { type: Actions.ADD_AWS_PROFILE };
      expect(Actions.addAWSProfile()).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const expectedState = deepClone(awsState);
      expectedState.list.push(deepClone(awsTemplate));
      expectedState.active = 1;
      expect(awsReducer(awsState, expectedAction)).toEqual(expectedState);
    });

    it('should update active profile', (done) => {
      const expectedAction = {
        type: Actions.UPDATE_ACTIVE_AWS_PROFILE,
        index: 3,
      };
      expect(Actions.updateActiveProfile(3)).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const expectedState = deepClone(awsState);
      expectedState.active = 0;
      expect(awsReducer(awsState, expectedAction)).toEqual(expectedState);

      const givenState = deepClone(awsState);
      givenState.list.push(profiles);
      givenState.active = 0;
      expectedState.active = 1;
      expectedState.list.push(profiles);
      expect(awsReducer(givenState, expectedAction)).toEqual(expectedState);
    });

    it('should update profiles', (done) => {
      const expectedAction = { type: Actions.UPDATE_AWS_PROFILES, profiles };
      expect(Actions.updateAWSProfiles(profiles)).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const expectedState = deepClone(initialState);
      expectedState.list = profiles;
      expectedState.mapById.a1 = profiles[0];
      expectedState.mapById.b2 = profiles[1];
      expect(awsReducer(initialState, expectedAction)).toEqual(expectedState);
    });
  });

  describe('async actions', () => {
    afterEach(() => {
      // expect.restoreSpies();
    });

    it('should fetch aws profiles', (done) => {
      const expectedAction = { type: Actions.UPDATE_AWS_PROFILES, profiles };
      setSpy(client, 'listAWSProfiles', profiles);
      expect(Actions.fetchAWSProfiles()).toDispatchActions(
        expectedAction,
        complete(done)
      );
    });

    it('should remove aws profile', (done) => {
      let expectedAction = { type: Actions.UPDATE_AWS_PROFILES, profiles };
      setSpy(client, 'deleteAWSProfile', null);
      setSpy(client, 'listAWSProfiles', profiles);
      expect(Actions.removeAWSProfile(0, profile)).toDispatchActions(
        expectedAction,
        complete(done)
      );

      expectedAction = { type: Actions.REMOVE_AWS_PROFILE, index: 0 };
      expect(Actions.removeAWSProfile(0, { name: 'no id' })).toDispatchActions(
        expectedAction,
        complete(done)
      );
    });

    it('should update aws profile', (done) => {
      setSpy(client, 'listAWSProfiles', awsState.list);
      setSpy(client, 'createAWSProfile', profile);
      let expectedAction = {
        type: Actions.UPDATE_AWS_PROFILES,
        profiles: [profile],
      };
      expect(Actions.updateAWSProfile(0, profile, true)).toDispatchActions(
        expectedAction,
        complete(done)
      );

      expectedAction = {
        type: Actions.SAVE_AWS_PROFILE,
        index: 0,
        profile,
      };
      expect(Actions.updateAWSProfile(0, profile, false)).toDispatchActions(
        expectedAction,
        complete(done)
      );
    });
  });
});
