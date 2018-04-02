import * as Actions from '../../src/redux/actions/volumes';
import volumeReducer, {
  volumeTemplate,
  initialState,
} from '../../src/redux/reducers/volumes';
import client from '../../src/network';

import expect from 'expect';
import thunk from 'redux-thunk';
import complete from '../helpers/complete';
import { registerMiddlewares } from 'redux-actions-assertions';
import { registerAssertions } from 'redux-actions-assertions/expect';
import deepClone from 'mout/src/lang/deepClone';
/* global describe it afterEach */

registerMiddlewares([thunk]);
registerAssertions();

function setSpy(target, method, data) {
  return expect.spyOn(target, method).andReturn(Promise.resolve({ data }));
}

describe('volumes', () => {
  // const sampleVolume = {};
  const profileId = 'abc123';
  describe('simple actions', () => {
    it('add a volume', (done) => {
      const expectedAction = { type: Actions.ADD_VOLUME, profileId };
      expect(Actions.addVolume(profileId)).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const expectedState = deepClone(initialState);
      const expectedVolume = deepClone(volumeTemplate);
      expectedVolume.profileId = profileId;
      expectedState.list.push(expectedVolume);
      expectedState.active = 0;
      expect(volumeReducer(initialState, expectedAction)).toEqual(
        expectedState
      );
    });

    it('updates active volume', (done) => {
      const active = 3;
      const expectedAction = { type: Actions.UPDATE_ACTIVE_VOLUME, active };
      expect(Actions.updateActiveVolume(active)).toDispatchActions(
        expectedAction,
        complete(done)
      );
    });

    it('updates volume list', (done) => {
      const volumes = [
        { _id: 'a', name: 'vol_a' },
        { _id: 'b', name: 'vol_b' },
      ];
      const expectedAction = { type: Actions.UPDATE_VOLUMES, volumes };
      expect(Actions.updateVolumes(volumes)).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const expectedState = deepClone(initialState);
      expectedState.list = volumes;
      expectedState.mapById = {
        a: Object.assign({}, volumeTemplate, { _id: 'a', name: 'vol_a' }),
        b: Object.assign({}, volumeTemplate, { _id: 'b', name: 'vol_b' }),
      };
      expect(volumeReducer(initialState, expectedAction)).toEqual(
        expectedState
      );
    });

    it('updates volume status', (done) => {
      const volumeId = 'def456';
      const status = 'ready';
      const expectedAction = {
        type: Actions.UPDATE_VOLUME_STATUS,
        status,
        volumeId,
      };
      expect(Actions.updateVolumeStatus(volumeId, status)).toDispatchActions(
        expectedAction,
        complete(done)
      );
    });

    it('removes offline volume', (done) => {
      const index = 0;
      const expectedActions = [{ type: Actions.REMOVE_VOLUME, index }];
      expect(
        Actions.removeVolume(index, { name: 'someVol' })
      ).toDispatchActions(expectedActions, complete(done));
    });

    it('updates volume', (done) => {
      const index = 0;
      const volume = { _id: 'a', name: 'vol_a' };
      const expectedActions = [{ type: Actions.SAVE_VOLUME, index, volume }];

      expect(Actions.updateVolume(index, volume, false)).toDispatchActions(
        expectedActions,
        complete(done)
      );
    });
  });

  describe('async action', () => {
    afterEach(() => {
      expect.restoreSpies();
    });

    it('fetches volumes', (done) => {
      const volumes = [
        { _id: 'a', name: 'vol_a' },
        { _id: 'b', name: 'vol_b' },
      ];
      const expectedActions = [{ type: Actions.UPDATE_VOLUMES, volumes }];

      setSpy(client, 'listVolumes', volumes);
      expect(Actions.fetchVolumes()).toDispatchActions(
        expectedActions,
        complete(done)
      );
    });

    it('deletes volumes', (done) => {
      const volumes = [{ _id: 'b', name: 'vol_b' }];
      const expectedActions = [{ type: Actions.REMOVE_VOLUME, index: 0 }];

      setSpy(client, 'deleteVolume', {});
      setSpy(client, 'listVolumes', volumes);
      expect(
        Actions.removeVolume(0, { _id: 'a', name: 'vol_a' })
      ).toDispatchActions(expectedActions, complete(done));
    });

    it('updates volumes', (done) => {
      const volumes = [
        { _id: 'a', name: 'vol_a' },
        { _id: 'b', name: 'vol_b' },
      ];
      const expectedActions = [{ type: Actions.UPDATE_VOLUMES, volumes }];

      setSpy(client, 'createVolume', { _id: 'a', name: 'vol_a' });
      setSpy(client, 'listVolumes', volumes);
      expect(
        Actions.updateVolume(0, { _id: 'a', name: 'vol_a' }, true)
      ).toDispatchActions(expectedActions, complete(done));
    });

    it('fetches volume log', (done) => {
      const log = [
        { entry: 'job submitted ...' },
        { entry: 'job running ...' },
        { entry: 'job finished ...' },
      ];
      setSpy(client, 'getVolumeLog', { log });
      const expectedAction = {
        type: Actions.UPDATE_VOLUME_LOG,
        id: 'abc',
        log,
      };
      expect(Actions.getVolumeLog('abc', 0)).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const givenState = deepClone(initialState);
      const expectedState = deepClone(givenState);
      expectedState.logById.abc = log;
      expect(volumeReducer(givenState, expectedAction)).toEqual(expectedState);
    });

    it('fetches volume log and appends', (done) => {
      const logEntry = { entry: 'job running' };
      setSpy(client, 'getVolumeLog', { log: logEntry });
      const expectedAction = {
        type: Actions.APPEND_TO_VOLUME_LOG,
        id: 'abc',
        logEntry,
      };
      expect(Actions.getVolumeLog('abc', 3)).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const givenState = deepClone(initialState);
      givenState.logById.abc = [{ entry: 'job starting' }];
      const expectedState = deepClone(givenState);
      expectedState.logById.abc.push(logEntry);
      expect(volumeReducer(givenState, expectedAction)).toEqual(expectedState);
    });
  });
});
