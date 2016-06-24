import { handleTaskflowChange } from '../../src/StateTransitionBehavior';

import * as ProjectActions  from '../../src/redux/actions/projects';
import * as TaskflowActions from '../../src/redux/actions/taskflows';
import * as ClusterActions  from '../../src/redux/actions/clusters';
import * as FSActions       from '../../src/redux/actions/fs';

// a full redux state, mostly empty, 1 project with two simulations
import fullState from '../sampleData/basicFullState';
import taskflowState from '../sampleData/basicTaskflowState';

import expect from 'expect';
import complete from '../helpers/complete';
import { registerAssertions } from 'redux-actions-assertions/expect';
import deepClone    from 'mout/src/lang/deepClone';

/* global describe it beforeAll afterAll*/
registerAssertions();

function setSpy(target, method, data) {
  expect.spyOn(target, method)
    .andReturn(data);
}

describe('StateTransitionBehavior', () => {
  const taskflowId = '574c9d900640fd6e133b4b57';
  const taskId = '574c9f350640fd6e13b11e39';
  fullState.taskflows = deepClone(taskflowState);

  it('should do nothing if there\'s no taskflow', () => {
    expect(handleTaskflowChange({})).toBe(undefined);
  });

  describe('should update the simulation status', () => {
    const taskflow = deepClone(fullState.taskflows.mapById[taskflowId]);
    const simulation = deepClone(fullState.simulations.mapById['574c8aa00640fd3f1a3b379f']);
    const metadata = Object.assign({}, simulation.metadata, { status: 'complete' });

    beforeAll(() => {
      setSpy(ProjectActions, 'saveSimulation', { type: 'NO-OP' });
    });

    afterAll(() => {
      expect.restoreSpies();
    });

    it('should set status to terminated if a job is terminated', () => {
      // if there is 1 terminated job, the status is terminated
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'terminated' } };
      metadata.status = 'terminated';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
    });

    it('should set status to terminated if at least one task is errored and there are no jobs', () => {
      // if there is 1 terminated job, the status is terminated
      taskflow.jobMapById = {};
      taskflow.taskMapById[taskId].status = 'error';
      metadata.status = 'terminated';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
    });

    it('should set status to running if not some terminating', () => {
      // if there is a running job, the status is running
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'running' } };
      metadata.status = 'running';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
    });

    it('should set status to complete', () => {
      // if every job and task is complete, status is complete
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';
      metadata.status = 'complete';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
    });
  });

  describe('should update the cluster', () => {
    const taskflow = deepClone(fullState.taskflows.mapById[taskflowId]);
    const simulation = deepClone(fullState.simulations.mapById['574c8aa00640fd3f1a3b379f']);

    beforeAll(() => {
      setSpy(ClusterActions, 'updateCluster', { type: 'NO-OP' });
    });

    afterAll(() => {
      expect.restoreSpies();
    });

    it('should not update the cluster if there\'s no cluster in state', () => {
      handleTaskflowChange(fullState, taskflow);
      expect(ClusterActions.updateCluster).toNotHaveBeenCalled();
    });

    it('should update the cluster if there is a tf cluster in state', () => {
      const cluster = taskflow.flow.meta.cluster;
      fullState.preferences.clusters.mapById['574c9d920640fd6e133b4b60'] = deepClone(cluster);
      cluster.config.simulation = {
        name: simulation.name,
        step: 'Simulation',
      };
      handleTaskflowChange(fullState, taskflow);
      expect(ClusterActions.updateCluster).toHaveBeenCalledWith(cluster);
    });
  });

  describe('should update actions', () => {

  });
});
