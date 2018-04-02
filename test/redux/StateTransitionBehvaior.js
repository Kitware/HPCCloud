import expect, { spyOn } from 'expect';
import { registerAssertions } from 'redux-actions-assertions/jasmine';
import deepClone from 'mout/src/lang/deepClone';

import { handleTaskflowChange } from '../../src/StateTransitionBehavior';

import * as ProjectActions from '../../src/redux/actions/projects';
import * as TaskflowActions from '../../src/redux/actions/taskflows';
import * as ClusterActions from '../../src/redux/actions/clusters';
import * as FSActions from '../../src/redux/actions/fs';

// a full redux state, mostly empty, 1 project with two simulations
import basicFullState from '../sampleData/basicFullState';
import taskflowState from '../sampleData/basicTaskflowState';

/* global describe it beforeEach afterAll */

// we spy on redux actions here, and they just need to return an action with some type
const emptyAction = { type: 'NO-OP' };
function setSpy(target, method, data) {
  spyOn(target, method).and.returnValue(data);
}

describe('StateTransitionBehavior', () => {
  beforeEach(registerAssertions);

  const taskflowId = '574c9d900640fd6e133b4b57';
  const taskId = '574c9f350640fd6e13b11e39';
  const clusterId = '574c9d920640fd6e133b4b60';
  let fullState;
  let taskflow;
  let simulation;
  let metadata;

  function setupState() {
    fullState = deepClone(basicFullState);
    fullState.taskflows = deepClone(taskflowState);
    taskflow = deepClone(fullState.taskflows.mapById[taskflowId]);
    simulation = deepClone(
      fullState.simulations.mapById['574c8aa00640fd3f1a3b379f']
    );
    metadata = Object.assign({}, simulation.metadata, { status: 'complete' });
  }

  it("does nothing if there's no taskflow", () => {
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

    beforeEach(() => {
      setSpy(ProjectActions, 'saveSimulation', emptyAction);
      setSpy(TaskflowActions, 'updateTaskflowMetadata', emptyAction);
    });

    afterAll(() => {
      fullState.preferences.clusters.mapById = {};
    });

    it('sets status to terminated, adds rerun to actions', () => {
      // if there is a terminated job, the status is terminated
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'terminated' } };
      taskflow.allComplete = false;
      metadata.status = 'terminated';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalled();
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalled(); // actions: ['rerun']
    });

    it('sets status to terminated, rerun in actions', () => {
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
    });

    it('sets status to running, terminate in actions', () => {
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
    });

    it('sets cluster status to launching, terminate not in actions', () => {
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
    });

    it('sets cluster status to provisioning, terminate not in actions', () => {
      taskflow.actions = ['terminate'];
      taskflow.taskMapById[taskId].status = 'running';
      taskflow.allComplete = false;
      metadata.status = 'running';
      const cluster = taskflow.flow.meta.cluster;
      cluster.status = 'provisioning';
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
    });

    it('sets status to complete, allComplete is true, actions is empty', () => {
      // if every job and task is complete, status is complete
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';
      taskflow.allComplete = false;
      metadata.status = 'complete';
      handleTaskflowChange(fullState, taskflow);
      expect(ProjectActions.saveSimulation).toHaveBeenCalledWith(
        Object.assign({}, simulation, { metadata })
      );
      // view page in workflows handles actions to take it to the next step.
      newMeta.actions = [];
      newMeta.allComplete = true;
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(
        taskflowId,
        newMeta
      );
    });

    it('adds the "terminate instance" button', () => {
      // if there's a cluster, and if it's running, we add the "terminate instance" button
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';

      const cluster = taskflow.flow.meta.cluster;
      cluster.status = 'running';
      cluster.type = 'ec2';
      fullState.preferences.clusters.mapById[clusterId] = cluster;
      newMeta.actions = ['terminateInstance'];

      handleTaskflowChange(fullState, taskflow);
      expect(TaskflowActions.updateTaskflowMetadata).toHaveBeenCalledWith(
        taskflowId,
        newMeta
      );
    });
  });

  describe('update the cluster', () => {
    beforeEach(() => {
      setupState();
      setSpy(ClusterActions, 'updateCluster', emptyAction);
    });

    it("not update the cluster if there's no cluster in state", () => {
      handleTaskflowChange(fullState, taskflow);
      expect(ClusterActions.updateCluster).not.toHaveBeenCalled();
    });

    it('update the cluster if there is no tf cluster in state', () => {
      const cluster = taskflow.flow.meta.cluster;
      fullState.preferences.clusters.mapById[clusterId] = cluster;
      cluster.config.simulation = {
        name: simulation.name,
        step: 'Simulation',
      };
      handleTaskflowChange(fullState, taskflow);
      expect(ClusterActions.updateCluster).not.toHaveBeenCalled();
    });
  });

  describe('taskflow output directory', () => {
    const newMeta = {
      actions: [],
      allComplete: true,
      outputDirectory: '/my/dir',
      primaryJob: 'pyfr_run',
    };

    beforeEach(() => {
      setupState();
      setSpy(TaskflowActions, 'updateTaskflowMetadata', emptyAction);
    });

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
      fsSpy = spyOn(FSActions, 'fetchFolder').and.returnValue(emptyAction);
    });

    it('does not update folders if not all complete', () => {
      handleTaskflowChange(fullState, taskflow);
      expect(FSActions.fetchFolder).not.toHaveBeenCalled();
    });

    it('updates folders if all tasks and jobs are complete', () => {
      // updates the input and output folder
      taskflow.jobMapById = { someId: { _id: 'someId', status: 'complete' } };
      taskflow.taskMapById[taskId].status = 'complete';
      taskflow.allComplete = false;

      handleTaskflowChange(fullState, taskflow);
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(
        simulation.metadata.inputFolder._id
      );
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(
        simulation.metadata.outputFolder._id
      );
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(
        simulation.steps[simulation.active].folderId
      );
      expect(fsSpy.calls.count()).toEqual(3);
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

      handleTaskflowChange(fullState, taskflow);
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(
        simulation.metadata.inputFolder._id
      );
      expect(FSActions.fetchFolder).toHaveBeenCalledWith(
        simulation.steps[simulation.active].folderId
      );
      expect(fsSpy.calls.count()).toEqual(2);
    });
  });
});
