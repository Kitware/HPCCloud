import * as Actions from '../../src/redux/actions/fs';
import fsReducer, { folderInitialState, initialState } from '../../src/redux/reducers/fs';
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

Object.freeze(initialState);

describe('fs', () => {
  const folder = { _id: 'a1b2' };
  const folderState = Object.assign({}, folderInitialState, { folder });
  const fsState = deepClone(initialState);
  fsState.folderMapById = { [folder._id]: folderState };
  Object.freeze(fsState);

  describe('simple actions', () => {
    it('should update folder', (done) => {
      const expectedAction = { type: Actions.UPDATE_FOLDER, folder, id: folder._id };
      expect(Actions.updateFolder(folder))
        .toDispatchActions(expectedAction, complete(done));

      expect(fsReducer(initialState, expectedAction))
        .toEqual(fsState);
    });

    // just reducer
    it('should open a folder', (done) => {
      const action = { type: Actions.TOGGLE_OPEN_FOLDER, folderId: folder._id };
      expect(Actions.toggleOpenFolder(folder._id, false))
        .toDispatchActions([], complete(done));

      // opens
      const newState = deepClone(fsState);
      newState.folderMapById[folder._id].open = !fsState.folderMapById[folder._id].open;
      expect(fsReducer(fsState, action))
        .toEqual(newState);

      // closes
      expect(fsReducer(newState, action))
        .toEqual(fsState);
    });
  });

  describe('async action', () => {
    afterEach(() => {
      expect.restoreSpies();
    });

    // // this stalls phantomJS?
    it('should fetch folders and child items', (done) => {
      const childFolders = [{ _id: 'c3d4' }, { _id: 'e5f6' }];
      const items = [{ _id: 'item1' }, { _id: 'item2' }, { _id: 'item3' }];
      const expectedActions = [
        { type: Actions.CHILDREN_FOLDERS, children: childFolders, id: folder._id },
        { type: Actions.CHILDREN_ITEMS, children: items, id: folder._id },
        { type: Actions.UPDATE_FOLDER, folder: childFolders[0], id: childFolders[0]._id },
        { type: Actions.UPDATE_FOLDER, folder: childFolders[1], id: childFolders[1]._id },
      ];

      setSpy(client, 'listFolders', childFolders);
      setSpy(client, 'listItems', items);

      expect(Actions.fetchFolder(folder._id, false))
        .toDispatchActions(expectedActions, complete(done));
    });
  });
});
