import * as Actions from '../../src/redux/actions/user';
import * as routingActions from '../../src/redux/actions/router';
import usersReducer, { initialState } from '../../src/redux/reducers/auth';
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

function setSpy(target, method, data, raw=false) {
  if (raw) {
    expect.spyOn(target, method)
      .andReturn(data);
  } else {
    expect.spyOn(target, method)
      .andReturn(Promise.resolve({ data }));
  }
}

describe('user', () => {
  const user = { _id: 'a1', name:'Tom' };
  describe('simple actions', () => {
    it('should trigger a login action', (done) => {
      const expectedAction = { type: Actions.LOGGED_IN, user };
      expect(Actions.loggedIn(user))
        .toDispatchActions(expectedAction, complete(done));

      const expectedState = Object.assign({}, initialState);
      expectedState.user = user;
      expect(usersReducer(initialState, expectedAction))
        .toEqual(expectedState);
    });
  });

  describe('async action', () => {
    afterEach(() => {
      expect.restoreSpies();
    });

    it('should login user', (done) => {
      const expectedActions = [
        { type: Actions.LOGGED_IN, user },
        routingActions.replace('/'),
      ];
      setSpy(client, 'login', user);
      setSpy(client, 'getLoggedInUser', user, true);
      expect(Actions.login('Tom', 'my-password'))
        .toDispatchActions(expectedActions, complete(done));
    });

    it('should logout user', (done) => {
      setSpy(client, 'logout', user);
      expect(Actions.logout())
        .toDispatchActions(routingActions.replace('/'), complete(done));
      expect(client.logout).toHaveBeenCalled();
    });

    it('should register user', (done) => {
      setSpy(client, 'createUser', user);
      expect(Actions.register('Tom', 'Bob', 'tbob11', 'test@wow.com', 'my-password'))
        .toDispatchActions(routingActions.replace('/Login'), complete(done));
      expect(client.createUser).toHaveBeenCalled();
    });
  });
});
