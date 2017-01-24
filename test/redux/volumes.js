import * as Actions from '../../src/redux/actions/volumes';
import volumeReducer, { volumeTemplate, initialState } from '../../src/redux/reducers/volumes';
import client from '../../src/network';

import expect from 'expect';
import thunk from 'redux-thunk';
import complete from '../helpers/complete';
import { registerMiddlewares } from 'redux-actions-assertions';
import { registerAssertions } from 'redux-actions-assertions/expect';
import deepClone    from 'mout/src/lang/deepClone';
/* global describe it afterEach */

registerMiddlewares([thunk]);
registerAssertions();

function setSpy(target, method, data) {
  expect.spyOn(target, method)
    .andReturn(Promise.resolve({ data }));
}

describe('volumes', () => {
  // const sampleVolume = {};
  const profileId = 'abc123';
  describe('simple actions', () => {
    it('add a volume', (done) => {
      const expectedAction = { type: Actions.ADD_VOLUME, profileId };
      expect(Actions.addVolume(profileId))
        .toDispatchActions(expectedAction, complete(done));

      const expectedState = deepClone(initialState);
      const expectedVolume = deepClone(volumeTemplate);
      expectedVolume.profileId = profileId;
      expectedState.list.push(expectedVolume);
      expectedState.active = 0;
      expect(volumeReducer(initialState, expectedAction))
        .toEqual(expectedState);
    });

    it('updates active volume', (done) => {
      const active = 3;
      const expectedAction = { type: Actions.UPDATE_ACTIVE_VOLUME, active };
      expect(Actions.updateActiveVolume(active))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('updates volume list', (done) => {
      done();
    });

    it('updates volume status', (done) => {
      const volumeId = 'def456';
      const status = 'ready';
      const expectedAction = { type: Actions.UPDATE_VOLUME_STATUS, status, volumeId };
      expect(Actions.updateVolumeStatus(volumeId, status))
        .toDispatchActions(expectedAction, complete(done));
    });
  });

  describe('async action', () => {
    afterEach(() => {
      expect.restoreSpies();
    });
  });
});
