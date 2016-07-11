import * as Actions from '../../src/redux/actions/clusters';
import clustersReducer, { clusterTemplate, initialState } from '../../src/redux/reducers/clusters';
import client from '../../src/network';
import * as ClusterHelpers from '../../src/network/helpers/clusters';
import style        from 'HPCCloudStyle/PageWithMenu.mcss';

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

describe('cluster actions', () => {
  const cluster = { _id: 'a1',
    type: 'trad',
    name: 'myCluster',
    status: 'unknown',
    classPrefix: '',
    log: [{ entry: 'created...' }, { entry: 'running...' }],
  };
  describe('simple actions', () => {
    it('should add an empty cluster', (done) => {
      const expectedAction = { type: Actions.ADD_CLUSTER };
      expect(Actions.addCluster())
        .toDispatchActions(expectedAction, complete(done));

      const newState = deepClone(initialState);
      newState.list = [deepClone(clusterTemplate)];
      newState.active = 0;
      expect(clustersReducer(initialState, expectedAction))
        .toEqual(newState);
    });

    it('should add an existing cluster', (done) => {
      const expectedAction = { type: Actions.ADD_EXISTING_CLUSTER, cluster };
      expect(Actions.addExistingCluster(cluster))
        .toDispatchActions(expectedAction, complete(done));

      const newState = deepClone(initialState);
      newState.mapById[cluster._id] = cluster;
      newState.list = [cluster];
      expect(clustersReducer(initialState, expectedAction))
        .toEqual(newState);
    });

    it('should apply cluster preset', (done) => {
      const expectedAction = { type: Actions.CLUSTER_APPLY_PRESET, index: 0, name: 'myCluster' };
      expect(Actions.applyPreset(0, 'myCluster'))
        .toDispatchActions(expectedAction, complete(done));

      // skipping reducer test
    });

    it('should remove cluster given an id', (done) => {
      const expectedAction = { type: Actions.REMOVE_CLUSTER_BY_ID, id: cluster._id };
      expect(Actions.removeClusterById(cluster._id))
        .toDispatchActions(expectedAction, complete(done));

      const givenState = deepClone(initialState);
      givenState.list = [cluster];
      givenState.mapById[cluster._id] = cluster;

      const expectedState = deepClone(initialState);
      expectedState.active = -1;

      expect(clustersReducer(givenState, expectedAction))
        .toEqual(expectedState);
    });

    it('update the active cluster in a list', (done) => {
      const index = 12;
      const expectedAction = { type: Actions.UPDATE_ACTIVE_CLUSTER, index };
      expect(Actions.updateActiveCluster(index))
        .toDispatchActions(expectedAction, complete(done));

      expect(clustersReducer(initialState, expectedAction).active)
        .toEqual(index);
    });

    it('update an existing cluster', (done) => {
      const expectedAction = { type: Actions.UPDATE_EXISTING_CLUSTER, cluster };
      expect(Actions.updateExistingCluster(cluster))
        .toDispatchActions(expectedAction, complete(done));

      // update the clusters name
      const newCluster = Object.assign({}, cluster, { name: 'some other name' });
      const givenState = deepClone(initialState);
      givenState.mapById[cluster._id] = newCluster;

      const expectedState = deepClone(initialState);
      expectedState.mapById[cluster._id] = cluster;

      expect(clustersReducer(givenState, expectedAction))
        .toEqual(expectedState);
    });

    it('should update the list of clusters', (done) => {
      const clusters = [
        { _id: 'a1', type: 'trad' },
        { _id: 'b2', type: 'trad' },
        { _id: 'c3', type: 'ec2' },
      ];
      const expectedAction = { type: Actions.UPDATE_CLUSTERS, clusters };
      expect(Actions.updateClusters(clusters))
        .toDispatchActions(expectedAction, complete(done));

      const expectedState = deepClone(initialState);
      expectedState.list = [clusters[0], clusters[1]];
      expectedState.active = 0;
      expectedState.mapById.a1 = clusters[0];
      expectedState.mapById.b2 = clusters[1];
      expectedState.mapById.c3 = clusters[2];
      expect(clustersReducer(initialState, expectedAction))
        .toEqual(expectedState);
    });

    it('should save a cluster locally', (done) => {
      const expectedAction = { type: Actions.SAVE_CLUSTER, index: 0, cluster };
      expect(Actions.saveCluster(0, cluster, false))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should remove a cluster', (done) => {
      const expectedActions = [{ type: Actions.REMOVE_CLUSTER, index: 0 }];

      expect(Actions.removeCluster(0))
        .toDispatchActions(expectedActions, complete(done));
    });

    it('should update cluster presets', (done) => {
      const presets = [{ name: 'myCluster' }, { name: 'myOtherCluster' }];
      const expectedAction = { type: Actions.UPDATE_CLUSTER_PRESETS, presets };
      expect(Actions.updateClusterPresets(presets))
        .toDispatchActions(expectedAction, complete(done));

      // skipping reducer test
    });

    it('should update a cluster\'s log by appending to it', (done) => {
      const logEntry = { entry: 'job submitted ...' };
      const expectedAction = { type: Actions.APPEND_TO_CLUSTER_LOG, id: cluster._id, logEntry };
      expect(Actions.appendToClusterLog(cluster._id, logEntry))
        .toDispatchActions(expectedAction, complete(done));

      const givenState = deepClone(initialState);
      givenState.mapById[cluster._id] = cluster;
      const expectedState = deepClone(initialState);
      expectedState.mapById[cluster._id] = deepClone(cluster);
      expectedState.mapById[cluster._id].log.push(logEntry);
      expect(clustersReducer(givenState, expectedAction))
        .toEqual(expectedState);
    });

    it('should update a cluster\'s log with a new log', (done) => {
      const log = [{ entry: 'job submitted ...' },
        { entry: 'job running ...' },
        { entry: 'job finished ...' },
      ];
      const expectedAction = { type: Actions.UPDATE_CLUSTER_LOG, id: cluster._id, log };
      expect(Actions.updateClusterLog(cluster._id, log))
        .toDispatchActions(expectedAction, complete(done));

      const givenState = deepClone(initialState);
      givenState.mapById[cluster._id] = cluster;
      const expectedState = deepClone(initialState);
      expectedState.mapById[cluster._id] = deepClone(cluster);
      expectedState.mapById[cluster._id].log = log;
      expect(clustersReducer(givenState, expectedAction))
        .toEqual(expectedState);
    });

    // only reducer
    it('should update a cluster\'s status', () => {
      const newStatus = 'terminated';
      const myCluster = deepClone(cluster);
      const givenState = deepClone(initialState);
      givenState.mapById[myCluster._id] = myCluster;
      givenState.list.push(myCluster);

      const expectedState = deepClone(givenState);
      expectedState.mapById[myCluster._id].status = newStatus;
      expectedState.mapById[myCluster._id].classPrefix = style.statusTerminatedIcon;
      expectedState.list[0].status = newStatus;
      expectedState.list[0].classPrefix = style.statusTerminatedIcon;

      const action = { type: Actions.UPDATE_CLUSTER_STATUS, id: cluster._id, status: newStatus };
      expect(clustersReducer(givenState, action))
        .toEqual(expectedState);
    });
  });

// ----------------------------------------------------------------------------
// AYSYNCHRONUS ACTIONS
// ----------------------------------------------------------------------------

  describe('async actions', () => {
    afterEach(() => {
      expect.restoreSpies();
    });

    it('should fetch cluster log', (done) => {
      const id = cluster._id;
      const log = [{ entry: 'one' }];
      setSpy(client, 'getClusterLog', { log });
      expect(Actions.getClusterLog(id))
        .toDispatchActions({ type: Actions.UPDATE_CLUSTER_LOG, id, log }, complete(done));
    });

    it('should fetch a cluster', (done) => {
      const expectedAction = { type: Actions.ADD_EXISTING_CLUSTER, cluster };
      setSpy(client, 'getCluster', expectedAction.cluster);
      expect(Actions.fetchCluster(expectedAction._id))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should fetch a list of clusters', (done) => {
      const clusters = [{ _id: 'a1' }, { _id: 'b2' }];
      const expectedAction = { type: Actions.UPDATE_CLUSTERS, clusters };
      setSpy(client, 'listClusters', clusters);
      expect(Actions.fetchClusters())
        .toDispatchActions(expectedAction, complete(done));
    });

    // removes a cluster from the preferences list and deletes it if has _id
    it('should delete a cluster', (done) => {
      const expectedAction = { type: Actions.REMOVE_CLUSTER_BY_ID, id: cluster._id };
      setSpy(client, 'deleteCluster', null);
      expect(Actions.deleteCluster(cluster._id))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should delete a cluster with an id', (done) => {
      const expectedActions = [{ type: Actions.UPDATE_CLUSTERS, clusters: [] }];
      setSpy(client, 'deleteCluster', null);
      setSpy(client, 'listClusters', []);
      expect(Actions.removeCluster(0, cluster))
        .toDispatchActions(expectedActions, complete(done));
    });

    it('should save a cluster remotely', (done) => {
      const expectedAction = { type: Actions.SAVE_CLUSTER, index: 0, cluster };
      setSpy(ClusterHelpers, 'saveCluster', null);
      expect(Actions.saveCluster(0, cluster, true))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should update a cluster', (done) => {
      const expectedAction = { type: Actions.UPDATE_EXISTING_CLUSTER, cluster };
      setSpy(client, 'updateCluster', cluster);
      expect(Actions.updateCluster(cluster))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should not test a cluster without an id', (done) => {
      const expectedAction = { type: 'NOOP', message: 'Cluster is not available on server yet' };
      expect(Actions.testCluster(0, {}))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should test a cluster', (done) => {
      const expectedAction = { type: Actions.TESTING_CLUSTER, index: 0 };
      setSpy(client, 'testCluster', null);
      expect(Actions.testCluster(0, cluster))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should terminate a cluster', (done) => {
      const expectedAction = { type: 'NOOP' };
      setSpy(client, 'terminateCluster', null);
      expect(Actions.terminateCluster(cluster._id))
        .toDispatchActions(expectedAction, complete(done));
    });
  });
});
