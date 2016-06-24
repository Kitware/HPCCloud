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

  describe('should update the simulation status and available taskflow actions', () => {
    const taskflow = deepClone(fullState.taskflows.mapById[taskflowId]);
    const simulation = deepClone(fullState.simulations.mapById['574c8aa00640fd3f1a3b379f']);
    const metadata = Object.assign({}, simulation.metadata, { status: 'complete' });
    const newMeta = {
      actions: ['rerun'],
      allComplete: false,
      outputDirectory: undefined,
      primaryJob: 'pyfr_run',
    };

    beforeAll(() => {
      setSpy(ProjectActions, 'saveSimulation', { type: 'NO-OP' });
      setSpy(TaskflowActions, 'updateTaskflowMetadata', { type: 'NO-OP' });
    });

    afterAll(() => {
      expect.restoreSpies();
    });

    it('should set status to terminated, rerun in actions', () => {
      // if there is 1 terminated job, the status is terminated
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'terminated' } };
      taskflow.allComplete = false;
      metadata.status = 'terminated';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(taskflowId, newMeta); // actions: ['rerun']
    });

    it('should set status to terminated, rerun in actions', () => {
      // if there is 1 terminated job, the status is terminated
      taskflow.jobMapById = {};
      taskflow.taskMapById[taskId].status = 'error';
      taskflow.allComplete = false;
      metadata.status = 'terminated';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(taskflowId, newMeta); // actions: ['rerun']
    });

    it('should set status to running, terminate in actions', () => {
      // if there is a running job, the status is running
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'running' } };
      metadata.status = 'running';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
      newMeta.actions = ['terminate'];
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(taskflowId, newMeta);
    });

    it('should set status to complete, allComplete is true, actions is empty', () => {
      // if every job and task is complete, status is complete
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';
      metadata.status = 'complete';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
      // view page in workflows handles actions to take it to the next step.
      newMeta.actions = [];
      newMeta.allComplete = true;
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(taskflowId, newMeta);
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

  describe('should update taskflow output directory', () => {
    const taskflow = deepClone(fullState.taskflows.mapById[taskflowId]);
    const simulation = deepClone(fullState.simulations.mapById['574c8aa00640fd3f1a3b379f']);
    const metadata = Object.assign({}, simulation.metadata, { status: 'complete' });
    const newMeta = {
      actions: [],
      allComplete: true,
      outputDirectory: '/my/dir',
      primaryJob: 'pyfr_run',
    };

    beforeAll(() => {
      setSpy(TaskflowActions, 'updateTaskflowMetadata', { type: 'NO-OP' });
    });

    afterAll(() => {
      expect.restoreSpies();
    });

    it('should update outputDirectory', () => {
      taskflow.jobMapById = { someId: { _id: 'someId', name: 'pyfr_run', status: 'complete', dir: '/my/dir' } };
      taskflow.allComplete = false;
      metadata.status = 'complete';
      handleTaskflowChange(fullState, taskflow);
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(taskflowId, newMeta);
    });
  });
});
