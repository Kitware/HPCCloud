import * as netActions  from './network';
import * as projActions from './projects';
import * as clusterActions from './clusters';
import client           from '../../network';
import { store, dispatch } from '..';

export const ADD_TASKFLOW = 'ADD_TASKFLOW';
export const UPDATE_TASKFLOW_LOG = 'UPDATE_TASKFLOW_LOG';
export const CLEAR_UPDATE_LOG = 'CLEAR_UPDATE_LOG';
export const UPDATE_TASKFLOW_STATUS = 'UPDATE_TASKFLOW_STATUS';
export const UPDATE_TASKFLOW_JOB_LOG = 'UPDATE_TASKFLOW_JOB_LOG';
export const UPDATE_TASKFLOW_JOB_STATUS = 'UPDATE_TASKFLOW_JOB_STATUS';
export const UPDATE_TASKFLOW_TASKS = 'UPDATE_TASKFLOW_TASKS';
export const UPDATE_TASKFLOW_TASK_STATUS = 'UPDATE_TASKFLOW_TASK_STATUS';
export const BIND_SIMULATION_TO_TASKFLOW = 'BIND_SIMULATION_TO_TASKFLOW';
export const DELETE_TASKFLOW = 'DELETE_TASKFLOW';
export const UPDATE_TASKFLOW_METADATA = 'UPDATE_TASKFLOW_METADATA';

/* eslint-disable no-shadow */

export function addTaskflow(taskflow, primaryJob = null) {
  return { type: ADD_TASKFLOW, taskflow, primaryJob };
}

export function attachSimulationToTaskflow(simulationId, taskflowId, stepName) {
  return { type: BIND_SIMULATION_TO_TASKFLOW, taskflowId, simulationId, stepName };
}

export function clearUpdateLog() {
  return { type: CLEAR_UPDATE_LOG };
}

export function updateTaskflowStatus(id, status) {
  return { type: UPDATE_TASKFLOW_STATUS, id, status };
}

export function startTaskflow(id, payload, simulationStep, location) {
  return dispatch => {
    const action = netActions.addNetworkCall('start_taskflow', 'Start taskflow');

    client.startTaskflow(id, payload)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));

          if (simulationStep) {
            const data = Object.assign(
              {},
              simulationStep.data,
              { metadata: Object.assign(
                {},
                simulationStep.data.metadata,
                { taskflowId: id }) });
            dispatch(projActions.updateSimulationStep(simulationStep.id, simulationStep.step, data, location));
          }
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function createTaskflow(taskFlowName, primaryJob, payload, simulationStep, location) {
  return dispatch => {
    const action = netActions.addNetworkCall('create_taskflow', 'Create taskflow');

    client.createTaskflow(taskFlowName)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(addTaskflow(resp.data, primaryJob));
          dispatch(attachSimulationToTaskflow(simulationStep.id, resp.data._id, simulationStep.step));
          dispatch(startTaskflow(resp.data._id, payload, simulationStep, location));
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function updateTaskflowLog(taskflowId) {
  return dispatch => {
    const action = netActions.addNetworkCall(`taskflow_log_${taskflowId}`, 'Check taskflow log');
    client.getTaskflowLog(taskflowId)
      .then(resp => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch({ type: UPDATE_TASKFLOW_LOG, taskflowId, log: resp.data.log });
      })
      .catch(error => {
        dispatch(netActions.errorNetworkCall(action.id, error));
      });
    return action;
  };
}

export function updateTaskflowJobLog(taskflowId, jobId) {
  return dispatch => {
    const action = netActions.addNetworkCall(`taskflow_job_log_${jobId}`, 'Check job log');

    client.getJobLog(jobId)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch({ type: UPDATE_TASKFLOW_JOB_LOG, taskflowId, jobId, log: resp.data.log });
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function updateTaskflowJobStatus(taskflowId, jobId, status) {
  return dispatch => {
    if (status) {
      return { type: UPDATE_TASKFLOW_JOB_STATUS, taskflowId, jobId, status };
    }
    const action = netActions.addNetworkCall(`taskflow_job_status_${jobId}`, 'Check job status');

    client.getJobStatus(jobId)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch({ type: UPDATE_TASKFLOW_JOB_STATUS, taskflowId, jobId, status: resp.data.status });
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function fetchTaskflowTasks(taskflowId) {
  return dispatch => {
    const action = netActions.addNetworkCall('taskflow_tasks', 'Check tasks');

    client.getTaskflowTasks(taskflowId)
      .then(
        resp => {
          const tasks = resp.data;
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch({ type: UPDATE_TASKFLOW_TASKS, taskflowId, tasks });
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function updateTaskflowTaskStatus(taskflowId, taskId, status) {
  return { type: UPDATE_TASKFLOW_TASK_STATUS, taskflowId, taskId, status };
}

export function fetchTaskflow(id) {
  return dispatch => {
    const action = netActions.addNetworkCall('taskflow_tasks', 'Check tasks');

    client.getTaskflow(id)
      .then(
        resp => {
          const taskflow = resp.data;
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(addTaskflow(taskflow));

          if (taskflow.meta && taskflow.meta.jobs) {
            taskflow.meta.jobs.forEach(job => {
              if (job.status !== 'complete' && job.status !== 'terminated') {
                dispatch(updateTaskflowJobStatus(id, job._id));
                dispatch(updateTaskflowJobLog(id, job._id));
              }
            });
          }
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
          dispatch({ type: DELETE_TASKFLOW, id: action.id });
        });

    dispatch(fetchTaskflowTasks(id));

    return action;
  };
}

export function updateTaskflowFromSimulation(simulation) {
  return dispatch => {
    Object.keys(simulation.steps).forEach(name => {
      const taskflowId = simulation.steps[name].metadata.taskflowId;
      if (taskflowId) {
        dispatch(fetchTaskflow(taskflowId));
        dispatch(attachSimulationToTaskflow(simulation._id, taskflowId, name));
      }
    });

    return { type: 'NOOP' };
  };
}

export function deleteTaskflow(id, simulationStep, location) {
  return dispatch => {
    const action = netActions.addNetworkCall('delete_taskflow', 'Delete taskflow');

    client.deleteTaskflow(id)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch({ type: DELETE_TASKFLOW, id });
          if (simulationStep) {
            dispatch(projActions.updateSimulationStep(simulationStep.id, simulationStep.step, simulationStep.data, location));
          }
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function terminateTaskflow(id) {
  return dispatch => {
    const action = netActions.addNetworkCall('terminate_taskflow', 'Terminate taskflow');

    client.endTaskflow(id)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function updateTaskflowMetadata(id, actions, allComplete, outputDirectory, primaryJob) {
  return { type: UPDATE_TASKFLOW_METADATA, id, actions, allComplete, outputDirectory, primaryJob };
}

// ----------------------------------------------------------------------------
// SSE Handling for taskflow, job, & task statuses
// ----------------------------------------------------------------------------

// find a discrete job and only update that one
function findJob(jobId) {
  return dispatch => {
    const state = store.getState();
    Object.keys(state.taskflows.mapById).forEach(id => {
      if (state.taskflows.mapById[id].status !== 'complete' &&
          state.taskflows.mapById[id].status !== 'terminated') {
        const action = netActions.addNetworkCall('taskflow_tasks', 'Check tasks');
        client.getTaskflow(id)
          .then((resp) => {
            const taskflow = resp.data;
            dispatch(netActions.successNetworkCall(action.id, resp));
            dispatch(addTaskflow(taskflow));

            if (taskflow.meta && taskflow.meta.jobs) {
              taskflow.meta.jobs.forEach(job => {
                // only update the status and the log if the jobId is the one we're looking for
                if (job._id === jobId) {
                  dispatch(updateTaskflowJobStatus(id, job._id));
                  dispatch(updateTaskflowJobLog(id, job._id));
                }
              });
            }
          })
          .catch((error) => {
            dispatch(netActions.errorNetworkCall(action.id, error));
            dispatch({ type: DELETE_TASKFLOW, id: action.id });
          });
      } // close if
    });
    return { type: 'NOOP' };
  };
}

// fetch tasks for each taskflow, the task objects which come back have log and status.
function findTask() {
  return dispatch => {
    const state = store.getState();
    Object.keys(state.taskflows.mapById).forEach(id => {
      if (state.taskflows.mapById[id].status !== 'complete' &&
          state.taskflows.mapById[id].status !== 'terminated') {
        dispatch(fetchTaskflowTasks(id));
      }
    });
    return { type: 'NOOP' };
  };
}

function getTaskflowIdFromId(id, type) {
  switch (type) {
    case 'task': {
      return store.getState().taskflows.taskflowMapByTaskId[id];
    }
    case 'job': {
      return store.getState().taskflows.taskflowMapByJobId[id];
    }
    case 'cluster': {
      return store.getState().preferences.clusters.mapById[id];
    }
    default: {
      return null;
    }
  }
}

function findCluster() {
  dispatch(clusterActions.fetchClusters());
  return { type: 'NOOP' };
}

client.onEvent((resp) => {
  const type = resp.type.split('.')[0];
  const id = resp.data._id;
  const status = resp.data.status;
  const taskflowId = getTaskflowIdFromId(id, type);

  if (type === 'taskflow') {
    dispatch(updateTaskflowStatus(id, status));
  } else if (taskflowId) {
    switch (type) {
      case 'job': {
        dispatch(updateTaskflowJobStatus(taskflowId, id, status));
        break;
      }
      case 'task': {
        dispatch(updateTaskflowTaskStatus(taskflowId, id, status));
        break;
      }
      case 'cluster': {
        dispatch(clusterActions.updateClusterStatus(id, status));
        break;
      }
      default:
        console.log(`unrecognized ServerEvent with type "${type}",` +
          ` taskflowId "${taskflowId}", and status "${status}"`);
        break;
    }
  } else {
    switch (type) {
      case 'job': {
        // find and update job
        dispatch(findJob(id));
        break;
      }
      case 'task': {
        // update all tasks for each taskflow
        dispatch(findTask());
        break;
      }
      case 'cluster': {
        // fetch clusters
        dispatch(findCluster());
        break;
      }
      default:
        console.log(`unrecognized ServerEvent with type "${type}",` +
          ` id "${id}", and status "${status}"`);
        break;
    }
  }
});

