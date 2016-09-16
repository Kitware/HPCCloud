import * as Actions from '../../src/redux/actions/taskflows';
import taskflowsReducer, { initialState } from '../../src/redux/reducers/taskflows';
import client from '../../src/network';

import taskflowState from '../sampleData/basicTaskflowState';

import expect from 'expect';
import thunk from 'redux-thunk';
import complete from '../helpers/complete';
import { registerMiddlewares } from 'redux-actions-assertions';
import { registerAssertions } from 'redux-actions-assertions/expect';
import deepClone from 'mout/src/lang/deepClone';
/* global describe it afterEach */

registerMiddlewares([thunk]);
registerAssertions();

function setSpy(target, method, data) {
  expect.spyOn(target, method)
    .andReturn(Promise.resolve({ data }));
}

Object.freeze(initialState);

describe('taskflow actions', () => {
  const taskflowId = '574c9d900640fd6e133b4b57';
  const taskflow = deepClone(taskflowState.mapById[taskflowId]);
  const task = Object.assign({}, taskflow.taskMapById['574c9f350640fd6e13b11e39']);
  describe('simple actions', () => {
    it('should clear update logs', (done) => {
      const expectedAction = { type: Actions.CLEAR_UPDATE_LOG };
      expect(Actions.clearUpdateLog())
        .toDispatchActions(expectedAction, complete(done));

      const givenState = deepClone(initialState);
      givenState.updateLogs = ['a1', 'b2'];
      expect(taskflowsReducer(givenState, expectedAction))
        .toEqual(initialState);
    });

    it('should update a task\'s status for in a taskflow', (done) => {
      // console.log(task, taskflow.taskMapById['574c9f350640fd6e13b11e39']);
      const newStatus = 'running';
      const expectedAction = {
        type: Actions.UPDATE_TASKFLOW_TASK_STATUS,
        taskflowId,
        status: newStatus,
        taskId: task._id,
      };
      expect(Actions.updateTaskflowTaskStatus(taskflowId, task._id, newStatus))
        .toDispatchActions(expectedAction, complete(done));

      const expectedTask = Object.assign({}, task);
      expectedTask.status = newStatus;
      expect(taskflowsReducer(taskflowState, expectedAction).mapById[taskflowId].taskMapById[task._id])
        .toEqual(expectedTask);
    });

    it('should add a taskflow', (done) => {
      const expectedAction = { type: Actions.ADD_TASKFLOW, taskflow: taskflow.flow, primaryJob: 'pyfr_run' };
      expect(Actions.addTaskflow(taskflow.flow, 'pyfr_run'))
        .toDispatchActions(expectedAction, complete(done));

      const newState = taskflowsReducer(deepClone(initialState), expectedAction);
      const expectedTaskflow = deepClone(taskflowState);
      // we don't have these properties from a taskflow that's just been added
      expectedTaskflow.mapById[taskflowId].taskMapById = {};
      expectedTaskflow.mapById[taskflowId].log = newState.mapById[taskflowId].log;
      expectedTaskflow.taskflowMapByTaskId = {};
      expectedTaskflow.taskflowMapByJobId = {};
      delete expectedTaskflow.mapById[taskflowId].allComplete;
      delete expectedTaskflow.mapById[taskflowId].stepName;
      delete expectedTaskflow.mapById[taskflowId].simulation;
      expect(newState)
        .toEqual(expectedTaskflow);
    });

    it('should attach a simulation to a taskflow', (done) => {
      const expectedAction = { type: Actions.BIND_SIMULATION_TO_TASKFLOW,
        taskflowId, simulationId: 'a1', stepName: 'visuzlization' };
      expect(Actions.attachSimulationToTaskflow('a1', taskflowId, 'visuzlization'))
        .toDispatchActions(expectedAction, complete(done));

      const newState = deepClone(taskflowState);
      newState.mapById[taskflowId].simulation = expectedAction.simulationId;
      newState.mapById[taskflowId].stepName = expectedAction.stepName;
      expect(taskflowsReducer(taskflowState, expectedAction))
        .toEqual(newState);
    });

    it('should update a taskflow\'s status', (done) => {
      const newStatus = 'running';
      const expectedAction = { type: Actions.UPDATE_TASKFLOW_STATUS, id: taskflowId, status: newStatus };
      expect(Actions.updateTaskflowStatus(taskflowId, newStatus))
        .toDispatchActions(expectedAction, complete(done));

      expect(taskflowsReducer(taskflowState, expectedAction).mapById[taskflowId].flow.status)
        .toEqual(newStatus);
    });

    it('should update taskflow properties', (done) => {
      const newMeta = {
        actions: ['stop', 'terminate'],
        allComplete: false,
        outputDirectory: '/my/dir/wow',
        primaryJob: 'some_new_primary_job',
      };
      const expectedAction = { type: Actions.UPDATE_TASKFLOW_METADATA, id: taskflowId, metadata: newMeta };
      expect(Actions.updateTaskflowMetadata(taskflowId, newMeta))
        .toDispatchActions(expectedAction, complete(done));

      const newState = deepClone(taskflowState);
      newState.mapById[taskflowId].allComplete = newMeta.allComplete;
      newState.mapById[taskflowId].actions = newMeta.actions;
      newState.mapById[taskflowId].outputDirectory = newMeta.outputDirectory;
      newState.mapById[taskflowId].primaryJob = newMeta.primaryJob;

      expect(taskflowsReducer(taskflowState, expectedAction))
        .toEqual(newState);
    });

    it('should update taskflow job log', (done) => {
      const logEntry = { entry: 'created...' };
      const expectedAction = { type: Actions.UPDATE_TASKFLOW_JOB_LOG, taskflowId, jobId: 'a1', logEntry };
      expect(Actions.updateTaskflowJobLog(taskflowId, 'a1', logEntry))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should update taskflow log', (done) => {
      const logEntry = { entry: 'created...' };
      const expectedAction = { type: Actions.UPDATE_TASKFLOW_LOG, taskflowId, logEntry };
      expect(Actions.updateTaskflowLog(taskflowId, logEntry))
        .toDispatchActions(expectedAction, complete(done));
    });
  });

// ----------------------------------------------------------------------------
// AYSYNCHRONUS ACTIONS
// ----------------------------------------------------------------------------

  describe('async actions', () => {
    afterEach(() => {
      expect.restoreSpies();
    });

    it('should update taskflow job status', (done) => {
      const newStatus = 'running';
      const expectedAction = { type: Actions.UPDATE_TASKFLOW_JOB_STATUS, taskflowId,
        jobId: 'a1', status: newStatus };
      expect(Actions.updateTaskflowJobStatus(taskflowId, 'a1', newStatus))
        .toDispatchActions(expectedAction, complete(done));

      // can be called without status parameter, calls async if it is
      setSpy(client, 'getJobStatus', { status: newStatus });
      expect(Actions.updateTaskflowJobStatus(taskflowId, 'a1'))
        .toDispatchActions(expectedAction, complete(done));

      expect(client.getJobStatus)
        .toHaveBeenCalled();
    });

    it('should start taskflow', (done) => {
      const fauxSim = { simulation: 'my sim' };
      const simulationStep = { id: 'mySimStep', step: 'Visuzlization',
        data: { metadata: { taskflowId: 'some_taskflow_id' } } };

      setSpy(client, 'startTaskflow', '');
      setSpy(client, 'updateSimulationStep', fauxSim);

      expect(Actions.startTaskflow(taskflowId, {}, simulationStep))
        .toDispatchActions([{ type: 'UPDATE_SIMULATION', simulation: fauxSim }], complete(done));

      expect(client.startTaskflow)
        .toHaveBeenCalled();
    });

    it('should create a taskflow', (done) => {
      const fauxSim = { simulation: 'my sim' };
      const simulationStep = { id: 'mySimStep', step: 'Visuzlization',
        data: { metadata: { } } };

      const expectedActions = [
        { type: Actions.ADD_TASKFLOW, primaryJob: 'pyfr' },
        { type: Actions.BIND_SIMULATION_TO_TASKFLOW, taskflowId, simulationId: 'mySimStep', stepName: 'Visuzlization' },
        { type: 'UPDATE_SIMULATION', simulation: fauxSim },
      ];

      setSpy(client, 'createTaskflow', taskflow.flow);
      setSpy(client, 'startTaskflow', '');
      setSpy(client, 'updateSimulationStep', fauxSim);

      expect(Actions.createTaskflow('myFlow', 'pyfr', { payload: 'some payload' }, simulationStep))
        .toDispatchActions(expectedActions, complete(done));
    });

    it('should fetch taskflow tasks', (done) => {
      const tasks = [{ name: 'task1' }, { name: 'task2' }];
      const expectedAction = { type: Actions.UPDATE_TASKFLOW_TASKS, taskflowId, tasks };
      setSpy(client, 'getTaskflowTasks', tasks);
      expect(Actions.fetchTaskflowTasks(taskflowId))
        .toDispatchActions(expectedAction, complete(done));
    });

    // big test, this dispatches a lot of actions
    it('should fetch a taskflow', (done) => {
      const clusters = [{ _id: 'a1' }, { _id: 'b2' }];
      const log = [{ entry: 'created...' }, { entry: 'running...' }];
      const flow = deepClone(taskflow.flow);
      flow.meta.jobs = [{ _id: 'job1', status: 'running' }];
      const expectedActions = [
        { type: Actions.ADD_TASKFLOW, taskflow: flow },
        { type: Actions.UPDATE_TASKFLOW_JOB_STATUS, taskflowId, jobId: 'job1', status: 'running' },
        { type: Actions.GET_TASKFLOW_JOB_LOG, taskflowId, jobId: 'job1', log },
      ];
      setSpy(client, 'getTaskflow', flow);
      setSpy(client, 'getJobLog', { log });
      setSpy(client, 'getJobStatus', { status: 'running' });
      setSpy(client, 'listClusters', clusters);
      expect(Actions.fetchTaskflow(taskflowId))
        .toDispatchActions(expectedActions, complete(done));
    });

    it('should update a taskflow from a simulation', (done) => {
      const simulation = {
        _id: 'mySimulationId',
        steps: {
          Visuzlization: {
            metadata: { taskflowId },
          },
        },
      };
      const flow = deepClone(taskflow.flow);
      const expectedActions = [
        { type: Actions.ADD_TASKFLOW, taskflow: flow },
        { type: Actions.BIND_SIMULATION_TO_TASKFLOW, taskflowId, simulationId: 'mySimulationId', stepName: 'Visuzlization' },
      ];
      setSpy(client, 'getTaskflow', flow);
      expect(Actions.updateTaskflowFromSimulation(simulation))
        .toDispatchActions(expectedActions, complete(done));
    });

    it('should delete a taskflow', (done) => {
      const expectedAction = { type: Actions.DELETE_TASKFLOW, id: taskflowId };
      setSpy(client, 'deleteTaskflow', null);
      expect(Actions.deleteTaskflow(taskflowId))
        .toDispatchActions(expectedAction, complete(done));

      expect(client.deleteTaskflow)
        .toHaveBeenCalled();
    });
  });
});
