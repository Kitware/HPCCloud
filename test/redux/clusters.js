import * as Actions from '../../src/redux/actions/clusters';
import clustersReducer, { initialState } from '../../src/redux/reducers/clusters';
import client from '../../src/network';
import * as ClusterHelpers from '../../src/network/helpers/clusters';

// import tradCluster from '../sampleData/projectsData';
// import ec2Cluster from '../sampleData/simulationsForProj1';

import expect from 'expect';
import thunk from 'redux-thunk';
import complete from '../helpers/complete';
import { registerMiddlewares } from 'redux-actions-assertions';
import { registerAssertions } from 'redux-actions-assertions/expect';
/* global describe it afterEach */

registerMiddlewares([thunk]);
registerAssertions();

function setSpy(target, method, data) {
  expect.spyOn(target, method)
    .andReturn(Promise.resolve({ data }));
}

describe('cluster actions', () => {
  describe('simple actions', () => {
    it('should add a fresh cluster', (done) => {
      const expectedAction = { type: Actions.ADD_CLUSTER };
      expect(Actions.addCluster())
        .toDispatchActions(expectedAction, complete(done));
    });

    // FIXME, needs sample data
    it('should add an existing cluster', (done) => {
      const expectedAction = { type: Actions.ADD_EXISTING_CLUSTER, cluster: { a: 1 } };
      expect(Actions.addExistingCluster({ a: 1 }))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should apply cluster preset', (done) => {
      const expectedAction = { type: Actions.CLUSTER_APPLY_PRESET, index: 0, name: 'myCluster' };
      expect(Actions.applyPreset(0, 'myCluster'))
        .toDispatchActions(expectedAction, complete(done));
    });

    // FIXME, needs sample data
    it('should remove cluster given an id', (done) => {
      const expectedAction = { type: Actions.REMOVE_CLUSTER_BY_ID, id: 'a1' };
      expect(Actions.removeClusterById('a1'))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('update the active cluster in a list', (done) => {
      const expectedAction = { type: Actions.UPDATE_ACTIVE_CLUSTER, index: 0 };
      expect(Actions.updateActiveCluster(0))
        .toDispatchActions(expectedAction, complete(done));
    });

    // FIXME, needs sample data
    it('update an existing cluster', (done) => {
      const expectedAction = { type: Actions.UPDATE_EXISTING_CLUSTER, cluster: { a: 1 } };
      expect(Actions.updateExistingCluster({ a: 1 }))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should update the list of clusters', (done) => {
      const clusters = [{ _id: 'a1' }, { _id: 'b2' }];
      const expectedAction = { type: Actions.UPDATE_CLUSTERS, clusters };
      expect(Actions.updateClusters(clusters))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should update cluster presets', (done) => {
      const presets = [{ name: 'myCluster' }, { name: 'myOtherCluster' }];
      const expectedAction = { type: Actions.UPDATE_CLUSTER_PRESETS, presets };
      expect(Actions.updateClusterPresets(presets))
        .toDispatchActions(expectedAction, complete(done));
    });

    // FIXME, needs sample data
    it('should update a cluster\' log', (done) => {
      const log = [{ entry: 'created ...' }];
      const expectedAction = { type: Actions.UPDATE_CLUSTER_LOG, id: 'a1', log };
      expect(Actions.updateClusterLog('a1', log))
        .toDispatchActions(expectedAction, complete(done));
    });

    // we only test the reducer here
    it('should update a cluster\'s status', () => {
      const thisState = Object.assign({}, initialState);
      thisState.mapById = { a1: { status: 'created' } };
      const action = { type: Actions.UPDATE_CLUSTER_STATUS, id: 'a1', status: 'terminated' };
      expect(clustersReducer(thisState, action).mapById.a1.status)
        .toEqual('terminated');
    });
  });

  describe('async actions', () => {
    afterEach(() => {
      expect.restoreSpies();
    });

    it('should fetch cluster log', (done) => {
      const id = 'a1';
      const log = [{ entry: 'one' }];
      setSpy(client, 'getClusterLog', { log });
      expect(Actions.getClusterLog(id))
        .toDispatchActions({ type: Actions.UPDATE_CLUSTER_LOG, id, log }, complete(done));
    });

    it('should fetch a cluster', (done) => {
      const expectedAction = { type: Actions.ADD_EXISTING_CLUSTER, cluster: { _id: 'myCluster' } };
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
      const expectedAction = { type: Actions.REMOVE_CLUSTER_BY_ID, id: 'a1' };
      setSpy(client, 'deleteCluster', null);
      expect(Actions.deleteCluster('a1'))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should save a cluster', (done) => {
      const expectedAction = { type: Actions.SAVE_CLUSTER, index: 0, cluster: { _id: 'a1' } };
      setSpy(ClusterHelpers, 'saveCluster', true);
      expect(Actions.saveCluster(0, { _id: 'a1' }, false))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should update a cluster', (done) => {
      const cluster = { _id: 'a1' };
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
      expect(Actions.testCluster(0, { _id: 'a1' }))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should terminate a cluster', (done) => {
      const expectedAction = { type: 'NOOP' };
      setSpy(client, 'terminateCluster', null);
      expect(Actions.terminateCluster('a1'))
        .toDispatchActions(expectedAction, complete(done));
    });
  });
});
