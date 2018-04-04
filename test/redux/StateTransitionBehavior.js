import expect from 'expect';
import thunk from 'redux-thunk';

import { registerMiddlewares } from 'redux-actions-assertions';
import { registerAssertions } from 'redux-actions-assertions/expect';
import deepClone from 'mout/src/lang/deepClone';

import { handleTaskflowChange } from '../../src/StateTransitionBehavior';

import * as ProjectActions from '../../src/redux/actions/projects';
import * as TaskflowActions from '../../src/redux/actions/taskflows';
import * as ClusterActions from '../../src/redux/actions/clusters';
import * as FSActions from '../../src/redux/actions/fs';

// a full redux state, mostly empty, 1 project with two simulations
import basicFullState from '../sampleData/basicFullState';
import taskflowState from '../sampleData/basicTaskflowState';

/* global describe it beforeEach afterAll afterEach */

Object.freeze(basicFullState);
Object.freeze(taskflowState);

registerMiddlewares([thunk]);
registerAssertions();

// we spy on redux actions here, and they just need to return an action with some type
const emptyAction = { type: 'NO-OP' };

const allSpies = [];

function setSpy(target, method, data) {
  const spy = expect.spyOn(target, method).andReturn(data);
  allSpies.push(spy);
  return spy;
}

function restoreSpies() {
  while (allSpies.length) {
    allSpies.pop().restore();
  }
}

describe('StateTransitionBehavior', () => {
  const taskflowId = '574c9d900640fd6e133b4b57';
  const taskId = '574c9f350640fd6e13b11e39';
  const clusterId = '574c9d920640fd6e133b4b60';
  let fullState;
  let taskflow;
  let simulation;
  let metadata;
  let newMeta;

  function setupState() {
    fullState = deepClone(basicFullState);
    fullState.taskflows = deepClone(taskflowState);
    taskflow = deepClone(fullState.taskflows.mapById[taskflowId]);
    simulation = deepClone(
      fullState.simulations.mapById['574c8aa00640fd3f1a3b379f']
    );
    metadata = Object.assign({}, simulation.metadata, { status: 'complete' });
    newMeta = {
      actions: ['rerun'],
      allComplete: false,
      outputDirectory: undefined,
      primaryJob: 'pyfr_run',
    };
  }

  it("does nothing if there's no taskflow", () => {
    expect(handleTaskflowChange({})).toBe(undefined);
  });

  describe('simulation status and taskflow actions', () => {
    beforeEach(() => {
      setupState();
      setSpy(ProjectActions, 'saveSimulation', emptyAction);
      setSpy(TaskflowActions, 'updateTaskflowMetadata', emptyAction);
      setSpy(FSActions, 'fetchFolder', emptyAction);
      // setSpy(ClusterActions, 'fetchCluster', emptyAction);
      setSpy(ClusterActions, 'updateCluster', emptyAction);
    });

    afterEach(restoreSpies);

    afterAll(() => {
      fullState.preferences.clusters.mapById = {};
    });

    it('sets status to terminated, adds rerun to actions', (done) => {
      // if there is a terminated job, the status is terminated
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'terminated' } };
      taskflow.allComplete = false;
      metadata.status = 'terminated';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalled();
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalled(); // actions: ['rerun']
      done();
    });

    it('sets status to terminated, rerun in actions', (done) => {
      // if there is an errored task, the status is terminated
      taskflow.jobMapById = {};
      taskflow.taskMapById[taskId].status = 'error';
      taskflow.allComplete = false;
      metadata.status = 'terminated';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(
        Object.assign({}, simulation, { metadata })
      );
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(
        taskflowId,
        newMeta
      ); // actions: ['rerun']
      done();
    });

    it('sets status to running, terminate in actions', (done) => {
      // if there is a running job, the status is running
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'running' } };
      taskflow.allComplete = false;
      metadata.status = 'running';
      fullState.preferences.clusters.mapById[clusterId] =
        taskflow.flow.meta.cluster;
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(
        Object.assign({}, simulation, { metadata })
      );
      newMeta.actions = ['terminate'];
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(
        taskflowId,
        newMeta
      );
      done();
    });

    it('sets cluster status to launching, terminate not in actions', (done) => {
      taskflow.actions = ['terminate'];
      taskflow.taskMapById[taskId].status = 'running';
      taskflow.allComplete = false;
      metadata.status = 'running';
      const cluster = taskflow.flow.meta.cluster;
      cluster.status = 'launching';
      fullState.preferences.clusters.mapById[clusterId] = cluster;
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(
        Object.assign({}, simulation, { metadata })
      );
      newMeta.actions = [];
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(
        taskflowId,
        newMeta
      );
      done();
    });

    it('sets cluster status to provisioning, terminate not in actions', (done) => {
      taskflow.actions = ['terminate'];
      taskflow.taskMapById[taskId].status = 'running';
      taskflow.allComplete = false;
      metadata.status = 'running';
      const cluster = taskflow.flow.meta.cluster;
      cluster.status = 'provisioning';
      fullState.preferences.clusters.mapById[clusterId] = cluster;
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalled();
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(
        Object.assign({}, simulation, { metadata })
      );
      newMeta.actions = [];
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(
        taskflowId,
        newMeta
      );
      done();
    });

    it('sets status to complete, allComplete is true, actions is empty', (done) => {
      // if every job and task is complete, status is complete
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';
      taskflow.allComplete = false;
      metadata.status = 'complete';
      const expectedArg = Object.assign({}, simulation, { metadata });
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation.calls[0].arguments[0]).toEqual(
        expectedArg
      );
      // view page in workflows handles actions to take it to the next step.
      newMeta.actions = [];
      newMeta.allComplete = true;
      expect(
        TaskflowActions.updateTaskflowMetadata.calls[0].arguments[1].actions
          .length
      ).toEqual(0);
      expect(
        TaskflowActions.updateTaskflowMetadata.calls[0].arguments[1].allComplete
      ).toBe(true);

      done();
    });

    it('adds the "terminate instance" button', (done) => {
      // if there's a cluster, and if it's running, we add the "terminate instance" button
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';

      const cluster = taskflow.flow.meta.cluster;
      cluster.status = 'running';
      cluster.type = 'ec2';
      fullState.preferences.clusters.mapById[clusterId] = cluster;

      handleTaskflowChange(fullState, taskflow);
      // newMeta.actions = ['terminateInstance'];
      // newMeta.allComplete = false;
      expect(
        TaskflowActions.updateTaskflowMetadata.calls[0].arguments[1].actions[0]
      ).toEqual('terminateInstance');
      done();
    });
  });

  describe('update the cluster', () => {
    beforeEach(() => {
      setupState();
      setSpy(ClusterActions, 'updateCluster', emptyAction);
    });

    afterEach(restoreSpies);

    it("not update the cluster if there's no cluster in state", () => {
      handleTaskflowChange(fullState, taskflow);
      expect(ClusterActions.updateCluster).toNotHaveBeenCalled();
    });

    it('update the cluster if there is no tf cluster in state', () => {
      const cluster = taskflow.flow.meta.cluster;
      fullState.preferences.clusters.mapById[clusterId] = cluster;
      cluster.config.simulation = {
        name: simulation.name,
        step: 'Simulation',
      };
      handleTaskflowChange(fullState, taskflow);
      expect(ClusterActions.updateCluster).toNotHaveBeenCalled();
    });
  });

  describe('taskflow output directory', () => {
    beforeEach(() => {
      setupState();
      newMeta = {
        actions: [],
        allComplete: true,
        outputDirectory: '/my/dir',
        primaryJob: 'pyfr_run',
      };
      setSpy(TaskflowActions, 'updateTaskflowMetadata', emptyAction);
    });

    afterEach(restoreSpies);

    it('updates outputDirectory', () => {
      taskflow.jobMapById = {
        someId: {
          _id: 'someId',
          name: 'pyfr_run',
          status: 'complete',
          dir: '/my/dir',
        },
      };
      taskflow.allComplete = false;
      metadata.status = 'complete';
      handleTaskflowChange(fullState, taskflow);
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(
        taskflowId,
        newMeta
      );
    });
  });

  describe('fs actions depending on taskflow state', () => {
    let fsSpy;

    beforeEach(() => {
      setupState();
      fsSpy = setSpy(FSActions, 'fetchFolder', emptyAction);
    });

    afterEach(restoreSpies);

    it('does not update folders if not all complete', () => {
      handleTaskflowChange(fullState, taskflow);
      expect(FSActions.fetchFolder).toNotHaveBeenCalled();
    });

    it('updates folders if all tasks and jobs are complete', () => {
      // updates the input and output folder
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';
      taskflow.allComplete = false;

      expect(fsSpy.calls.length).toEqual(0);
      handleTaskflowChange(fullState, taskflow);
      expect(fsSpy.calls.length).toEqual(3);
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(
        simulation.metadata.inputFolder._id
      );
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(
        simulation.metadata.outputFolder._id
      );
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(
        simulation.steps[simulation.active].folderId
      );
    });

    it('does not update output folders if it has children', () => {
      // if the output folder already has items, do not update it.
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';
      taskflow.allComplete = false;

      fullState.fs.folderMapById[simulation.metadata.outputFolder._id] = {
        itemChildren: [1, 2, 3],
        folderChildren: [4, 5, 6], // these just need to have some length
      };

      expect(fsSpy.calls.length).toEqual(0);
      handleTaskflowChange(fullState, taskflow);
      expect(fsSpy.calls.length).toEqual(2);
      const folderIds = FSActions.fetchFolder.calls.map((c) => c.arguments[0]);
      const expected = [
        simulation.metadata.inputFolder._id,
        simulation.steps[simulation.active].folderId,
      ];
      folderIds.sort();
      expected.sort();

      expect(folderIds).toEqual(expected);
    });
  });
});
