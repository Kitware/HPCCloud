import * as Actions from '../../src/redux/actions/network';
import netReducer, { initialState } from '../../src/redux/reducers/network';
// import client from '../../src/network';

import expect from 'expect';
import thunk from 'redux-thunk';
import complete from '../helpers/complete';
import { registerMiddlewares } from 'redux-actions-assertions';
import { registerAssertions } from 'redux-actions-assertions/expect';
import deepClone from 'mout/src/lang/deepClone';
/* global describe it afterEach */

// function setSpy(target, method, data) {
//   expect.spyOn(target, method)
//     .andReturn(Promise.resolve({ data }));
// }

registerMiddlewares([thunk]);
registerAssertions();

describe('network', () => {
  describe('simple actions', () => {
    it('logs successful requests', (done) => {
      const expectedAction = {
        type: Actions.SUCCESS_NETWORK_CALL,
        id: '01',
        resp: {},
      };
      expect(Actions.successNetworkCall('01', {})).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const givenState = deepClone(initialState);
      givenState.pending = { '01': { id: '01', resp: {} } };
      const expectedState = deepClone(givenState);
      expectedState.success = { '01': givenState.pending['01'] };
      delete expectedState.pending['01'];

      expect(netReducer(givenState, expectedAction)).toEqual(expectedState);
    });

    it('logs application network errors', (done) => {
      const someTimeout = setTimeout(() => {}, 50);
      const expectedAction = {
        type: Actions.ERROR_NETWORK_CALL,
        id: '01',
        resp: {},
        errorTimeout: someTimeout + 1,
        errType: 'application',
      };
      expect(Actions.errorNetworkCall('01', {})).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const givenState = deepClone(initialState);
      givenState.pending = { '01': { id: '01', resp: {} } };
      const expectedState = deepClone(givenState);
      expectedState.error = {
        '01': Object.assign({}, givenState.pending['01'], { invalid: false }),
      };
      expectedState.activeErrors.application = ['01'];
      expectedState.errorTimeout = someTimeout + 1;
      delete expectedState.pending['01'];

      expect(netReducer(givenState, expectedAction)).toEqual(expectedState);
    });

    it('logs form network errors', (done) => {
      const someTimeout = setTimeout(() => {}, 50);
      const expectedAction = {
        type: Actions.ERROR_NETWORK_CALL,
        id: '01',
        resp: {},
        errorTimeout: someTimeout + 1,
        errType: 'form',
      };
      expect(Actions.errorNetworkCall('01', {}, 'form')).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const givenState = deepClone(initialState);
      givenState.pending = { '01': { id: '01', resp: {} } };
      const expectedState = deepClone(givenState);
      expectedState.error = {
        '01': Object.assign({}, givenState.pending['01'], { invalid: false }),
      };
      expectedState.activeErrors.form = ['01'];
      expectedState.errorTimeout = someTimeout + 1;
      delete expectedState.pending['01'];

      expect(netReducer(givenState, expectedAction)).toEqual(expectedState);
    });

    it('invalidates single network errors given an id', (done) => {
      const expectedAction = {
        type: Actions.INVALIDATE_ERROR,
        id: '01',
        errType: 'form',
      };
      expect(Actions.invalidateError('01', 'form')).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const someTimeout = setTimeout(() => {}, 50);
      const givenState = deepClone(initialState);
      givenState.errorTimeout = someTimeout;
      givenState.error = {
        '01': { id: '01', resp: { data: { message: 'wow' } }, invalid: false },
      };
      givenState.activeErrors.form = ['01'];
      const expectedState = deepClone(givenState);
      expectedState.errorTimeout = null;
      expectedState.error = {
        '01': Object.assign({}, givenState.error['01'], { invalid: true }),
      };
      expectedState.activeErrors.form = [];

      expect(netReducer(givenState, expectedAction)).toEqual(expectedState);
    });

    it('invalidates multiple network errors given ids', (done) => {
      const expectedAction = {
        type: Actions.INVALIDATE_ERRORS,
        ids: ['01', '02'],
        errType: 'form',
      };
      expect(Actions.invalidateErrors(['01', '02'], 'form')).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const someTimeout = setTimeout(() => {}, 50);
      const givenState = deepClone(initialState);
      givenState.errorTimeout = someTimeout;
      givenState.error = {
        '01': { id: '01', resp: { data: { message: 'wow' } }, invalid: false },
        '02': { id: '02', resp: { data: { message: 'yay' } }, invalid: false },
      };
      givenState.activeErrors.form = ['01', '02'];
      const expectedState = deepClone(givenState);
      expectedState.errorTimeout = null;
      expectedState.error = {
        '01': Object.assign({}, givenState.error['01'], { invalid: true }),
        '02': Object.assign({}, givenState.error['02'], { invalid: true }),
      };
      expectedState.activeErrors.form = [];

      expect(netReducer(givenState, expectedAction)).toEqual(expectedState);
    });

    it('invalidates all network errors given *', (done) => {
      const expectedAction = { type: Actions.INVALIDATE_ERRORS, ids: '*' };
      expect(Actions.invalidateErrors('*')).toDispatchActions(
        expectedAction,
        complete(done)
      );

      const someTimeout = setTimeout(() => {}, 50);
      const givenState = deepClone(initialState);
      givenState.errorTimeout = someTimeout;
      givenState.error = {
        '01': { id: '01', resp: { data: { message: 'wow' } }, invalid: false },
        '02': { id: '02', resp: { data: { message: 'yay' } }, invalid: false },
      };
      givenState.activeErrors.form = ['01', '02'];
      givenState.activeErrors.application = ['03', '04'];
      const expectedState = deepClone(givenState);
      expectedState.errorTimeout = null;
      expectedState.error = {
        '01': Object.assign({}, givenState.error['01'], { invalid: true }),
        '02': Object.assign({}, givenState.error['02'], { invalid: true }),
      };
      expectedState.activeErrors.form = [];
      expectedState.activeErrors.application = [];

      expect(netReducer(givenState, expectedAction)).toEqual(expectedState);
    });
  });
});
