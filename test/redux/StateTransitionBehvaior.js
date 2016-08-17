import { handleTaskflowChange } from '../../src/StateTransitionBehavior';

import * as ProjectActions  from '../../src/redux/actions/projects';
import * as TaskflowActions from '../../src/redux/actions/taskflows';
import * as ClusterActions  from '../../src/redux/actions/clusters';
import * as FSActions       from '../../src/redux/actions/fs';

// a full redux state, mostly empty, 1 project with two simulations
import basicFullState from '../sampleData/basicFullState';
import taskflowState from '../sampleData/basicTaskflowState';

import expect from 'expect';
import { registerAssertions } from 'redux-actions-assertions/expect';
import deepClone    from 'mout/src/lang/deepClone';

/* global describe it beforeAll afterEach afterAll*/
registerAssertions();

// we spy on redux actions here, and they just need to return an action with some type
const emptyAction = { type: 'NO-OP' };
function setSpy(target, method, data) {
  expect.spyOn(target, method)
    .andReturn(data);
}

describe('StateTransitionBehavior', () => {
  const taskflowId = '574c9d900640fd6e133b4b57';
  const taskId = '574c9f350640fd6e13b11e39';
  const clusterId = '574c9d920640fd6e133b4b60';
  let fullState, taskflow, simulation, metadata;

  function setupState() {
    fullState = deepClone(basicFullState);
    fullState.taskflows = deepClone(taskflowState);
    taskflow = deepClone(fullState.taskflows.mapById[taskflowId]);
    simulation = deepClone(fullState.simulations.mapById['574c8aa00640fd3f1a3b379f']);
    metadata = Object.assign({}, simulation.metadata, { status: 'complete' });
  }

  it('should do nothing if there\'s no taskflow', () => {
    expect(handleTaskflowChange({})).toBe(undefined);
  });

  describe('simulation status and taskflow actions', () => {

    const newMeta = {
      actions: ['rerun'],
      allComplete: false,
      outputDirectory: undefined,
      primaryJob: 'pyfr_run',
    };

    beforeEach(setupState);

    beforeAll(() => {
      setSpy(ProjectActions, 'saveSimulation', emptyAction);
      setSpy(TaskflowActions, 'updateTaskflowMetadata', emptyAction);
    });

    afterAll(() => {
      expect.restoreSpies();
      fullState.preferences.clusters.mapById = {};
    });

    it('should set status to terminated, rerun in actions', () => {
      // if there is a terminated job, the status is terminated
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'terminated' } };
      taskflow.allComplete = false;
      metadata.status = 'terminated';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(taskflowId, newMeta); // actions: ['rerun']
    });

    it('should set status to terminated, rerun in actions', () => {
      // if there is an errored task, the status is terminated
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
      taskflow.allComplete = false;
      metadata.status = 'running';
      fullState.preferences.clusters.mapById[clusterId] = taskflow.flow.meta.cluster
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
      newMeta.actions = ['terminate'];
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(taskflowId, newMeta);
    });

    it('should set cluster status to launching, terminate not in actions', () => {
      taskflow.actions = ['terminate'];
      taskflow.taskMapById[taskId].status = 'running';
      taskflow.allComplete = false;
      metadata.status = 'running';
      const cluster = taskflow.flow.meta.cluster;
      cluster.status = 'launching'
      fullState.preferences.clusters.mapById[clusterId] = cluster
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
      newMeta.actions = [];
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(taskflowId, newMeta);
    });

    it('should set cluster status to provisioning, terminate not in actions', () => {
      taskflow.actions = ['terminate'];
      taskflow.taskMapById[taskId].status = 'running';
      taskflow.allComplete = false;
      metadata.status = 'running';
      const cluster = taskflow.flow.meta.cluster;
      cluster.status = 'provisioning'
      fullState.preferences.clusters.mapById[clusterId] = cluster
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
      newMeta.actions = [];
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(taskflowId, newMeta);
    });


    it('should set status to complete, allComplete is true, actions is empty', () => {
      // if every job and task is complete, status is complete
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';
      taskflow.allComplete = false;
      metadata.status = 'complete';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(Object.assign({}, simulation, { metadata }));
      // view page in workflows handles actions to take it to the next step.
      newMeta.actions = [];
      newMeta.allComplete = true;
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(taskflowId, newMeta);
    });

    it('should add the "terminate instance" button', () => {
      // if there's a cluster, and if it's running, we add the "terminate instance" button
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';

      const cluster = taskflow.flow.meta.cluster;
      cluster.status = 'running';
      cluster.type = 'ec2';
      fullState.preferences.clusters.mapById[clusterId] = cluster;
      newMeta.actions = ['terminateInstance'];

      handleTaskflowChange(fullState, taskflow);
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(taskflowId, newMeta);
    });
  });

  describe('update the cluster', () => {

    beforeEach(setupState);

    beforeAll(() => {
      setSpy(ClusterActions, 'updateCluster', emptyAction);
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
      fullState.preferences.clusters.mapById[clusterId] = cluster;
      cluster.config.simulation = {
        name: simulation.name,
        step: 'Simulation',
      };
      handleTaskflowChange(fullState, taskflow);
      expect(ClusterActions.updateCluster).toHaveBeenCalledWith(cluster);
    });
  });

  describe('taskflow output directory', () => {
    const newMeta = {
      actions: [],
      allComplete: true,
      outputDirectory: '/my/dir',
      primaryJob: 'pyfr_run',
    };

    beforeEach(setupState);

    beforeAll(() => {
      setSpy(TaskflowActions, 'updateTaskflowMetadata', emptyAction);
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

  describe('fs actions depending on taskflow state', () => {
    let fsSpy;

    beforeEach(setupState);

    beforeAll(() => {
      fsSpy = expect.spyOn(FSActions, 'fetchFolder').andReturn(emptyAction);
    });

    afterEach(() => {
      fsSpy.reset(); // Clears out all saved calls to the spy.
    });

    afterAll(() => {
      expect.restoreSpies();
    });

    it('should not update folders if not all complete', () => {
      handleTaskflowChange(fullState, taskflow);
      expect(FSActions.fetchFolder).toNotHaveBeenCalled();
    });

    it('should update folders if all tasks and jobs are complete', () => {
      // updates the input and output folder
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';
      taskflow.allComplete = false;

      handleTaskflowChange(fullState, taskflow);
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(simulation.metadata.inputFolder._id);
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(simulation.metadata.outputFolder._id);
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(simulation.steps[simulation.active].folderId);
      expect(fsSpy.calls.length).toEqual(3);
    });

    it('should not update output folders if it has children', () => {
      // if the output folder already has items, do not update it.
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';
      taskflow.allComplete = false;

      fullState.fs.folderMapById[simulation.metadata.outputFolder._id] = {
        itemChildren: [1, 2, 3],
        folderChildren: [4, 5, 6], // these just need to have some length
      };

      handleTaskflowChange(fullState, taskflow);
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(simulation.metadata.inputFolder._id);
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(simulation.steps[simulation.active].folderId);
      expect(fsSpy.calls.length).toEqual(2);
    });
  });
});
