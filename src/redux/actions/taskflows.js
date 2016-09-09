import * as netActions     from './network';
import * as projActions    from './projects';
import * as clusterActions from './clusters';
import client              from '../../network';
import get                 from '../../utils/get';
import { store, dispatch } from '..';

export const PENDING_TASKFLOW_NETWORK = 'PENDING_TASKFLOW_NETWORK';
export const CLEAR_UPDATE_LOG = 'CLEAR_UPDATE_LOG';
export const UPDATE_TASKFLOW = 'UPDATE_TASKFLOW';
export const GET_TASKFLOW_LOG = 'UPDATE_TASKFLOW_LOG';
export const UPDATE_TASKFLOW_LOG = 'UPDATE_TASKFLOW_LOG';
export const GET_TASKFLOW_JOB_LOG = 'GET_TASKFLOW_JOB_LOG';
export const UPDATE_TASKFLOW_JOB_LOG = 'UPDATE_TASKFLOW_JOB_LOG';
export const UPDATE_TASKFLOW_TASK_LOG = 'UPDATE_TASKFLOW_TASK_LOG';
export const TRIGGER_UPDATE = 'TRIGGER_UPDATE';

export const UPDATE_TASKFLOW_JOB_STATUS = 'UPDATE_TASKFLOW_JOB_STATUS';
export const UPDATE_TASKFLOW_TASK_STATUS = 'UPDATE_TASKFLOW_TASK_STATUS';

export const ADD_TASKFLOW = 'ADD_TASKFLOW';
export const UPDATE_TASKFLOW_STATUS = 'UPDATE_TASKFLOW_STATUS';
export const UPDATE_TASKFLOW_TASKS = 'UPDATE_TASKFLOW_TASKS';
export const UPDATE_TASKFLOW_METADATA = 'UPDATE_TASKFLOW_METADATA';
export const BIND_SIMULATION_TO_TASKFLOW = 'BIND_SIMULATION_TO_TASKFLOW';
export const DELETE_TASKFLOW = 'DELETE_TASKFLOW';

/* eslint-disable no-shadow */

export function pendingNetworkCall(taskflowId, isPending = true) {
  return { type: PENDING_TASKFLOW_NETWORK, taskflowId, isPending };
}

// ----------------------------------------------------------------------------
// LOGGING
// ----------------------------------------------------------------------------

export function clearUpdateLog() {
  return { type: CLEAR_UPDATE_LOG };
}

export function updateTaskflowLog(taskflowId, logEntry) {
  return { type: UPDATE_TASKFLOW_LOG, taskflowId, logEntry };
}

// this is a bit of a "force update" for StateTransitionBehavior
export function triggerUpdate(taskflowId) {
  return { type: TRIGGER_UPDATE, taskflowId };
}

export function getTaskflowLog(taskflowId) {
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

export function updateTaskflowJobLog(taskflowId, jobId, logEntry) {
  return { type: UPDATE_TASKFLOW_JOB_LOG, taskflowId, jobId, logEntry };
}

export function getTaskflowJobLog(taskflowId, jobId) {
  return dispatch => {
    const action = netActions.addNetworkCall(`taskflow_job_log_${jobId}`, 'Check job log');

    client.getJobLog(jobId)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch({ type: GET_TASKFLOW_JOB_LOG, taskflowId, jobId, log: resp.data.log });
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function updateTaskflowTaskLog(taskflowId, taskId, logEntry) {
  return { type: UPDATE_TASKFLOW_TASK_LOG, taskflowId, taskId, logEntry };
}

// ----------------------------------------------------------------------------
// STATUSES
export function updateTaskflowJobStatus(taskflowId, jobId, status) {
  if (status) {
    return { type: UPDATE_TASKFLOW_JOB_STATUS, taskflowId, jobId, status };
  }
  return dispatch => {
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

export function updateTaskflowTaskStatus(taskflowId, taskId, status) {
  return { type: UPDATE_TASKFLOW_TASK_STATUS, taskflowId, taskId, status };
}

// ----------------------------------------------------------------------------
// CRUD operations

export function addTaskflow(taskflow, primaryJob = null) {
  return { type: ADD_TASKFLOW, taskflow, primaryJob };
}

export function attachSimulationToTaskflow(simulationId, taskflowId, stepName) {
  return { type: BIND_SIMULATION_TO_TASKFLOW, taskflowId, simulationId, stepName };
}

export function updateTaskflowStatus(id, status) {
  return { type: UPDATE_TASKFLOW_STATUS, id, status };
}

export function updateTaskflowMetadata(id, metadata) {
  // metadata can have: { actions, allComplete, outputDirectory, primaryJob }
  return { type: UPDATE_TASKFLOW_METADATA, id, metadata };
}

export function startTaskflow(id, payload, simulationStep, location) {
  return dispatch => {
    const action = netActions.addNetworkCall('start_taskflow', 'Start taskflow');

    client.startTaskflow(id, payload)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));

          if (simulationStep) {
            const data = Object.assign({}, simulationStep.data,
              { metadata: Object.assign({}, simulationStep.data.metadata, { taskflowId: id }),
            });
            dispatch(projActions.updateSimulationStep(simulationStep.id, simulationStep.step, data, location));
          }
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error, 'form'));
        });

    return action;
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

export function createTaskflow(taskFlowName, primaryJob, payload, simulationStep, location) {
  return dispatch => {
    const action = netActions.addNetworkCall('create_taskflow', 'Create taskflow');

    client.createTaskflow(taskFlowName)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          const targetSimulationStep = get(store.getState().simulations, `mapById.${simulationStep.id}.steps.${simulationStep.step}`);
          if (targetSimulationStep && get(targetSimulationStep, 'metadata.taskflowId')) {
            dispatch(deleteTaskflow(targetSimulationStep.metadata.taskflowId));
          }
          dispatch(addTaskflow(resp.data, primaryJob));
          dispatch(attachSimulationToTaskflow(simulationStep.id, resp.data._id, simulationStep.step));
          dispatch(startTaskflow(resp.data._id, payload, simulationStep, location));
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error, 'form'));
        });

    return action;
  };
}

export function fetchTaskflowTasks(taskflowId) {
  if (store.getState().taskflows.pending.indexOf(taskflowId) !== -1) {
    return { type: 'NOOP' };
  }
  return dispatch => {
    const action = netActions.addNetworkCall('taskflow_tasks', 'Check tasks');
    dispatch(pendingNetworkCall(taskflowId, true));
    client.getTaskflowTasks(taskflowId)
      .then(
        resp => {
          const tasks = resp.data;
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch({ type: UPDATE_TASKFLOW_TASKS, taskflowId, tasks });
          dispatch(pendingNetworkCall(taskflowId, false));
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
          dispatch(pendingNetworkCall(taskflowId, false));
        });

    return action;
  };
}

export function fetchTaskflow(id) {
  return dispatch => {
    const action = netActions.addNetworkCall('taskflow_tasks', 'Check tasks');

    client.getTaskflow(id)
      .then(resp => {
        const taskflow = resp.data;
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(addTaskflow(taskflow));

        if (taskflow.meta) {
          if (taskflow.meta.jobs) {
            taskflow.meta.jobs.forEach(job => {
              if (job.status !== 'complete' && job.status !== 'terminated') {
                dispatch(updateTaskflowJobStatus(id, job._id));
                dispatch(getTaskflowJobLog(id, job._id));
              }
            });
          }
          if (taskflow.meta.cluster) {
            clusterActions.fetchClusters();
          }
        }
      })
      .catch(error => {
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

export function terminateTaskflow(id) {
  return dispatch => {
    const action = netActions.addNetworkCall(`terminate_taskflow_${id}`, 'Terminate taskflow');

    client.endTaskflow(id)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error, 'form'));
        });

    return action;
  };
}

// ----------------------------------------------------------------------------
// SSE Handling for taskflow, job, & task statuses
// ----------------------------------------------------------------------------

// find a discrete job and only update that one
function findJob(jobId, updateLog = false) {
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
                // only update the status if the jobId is the one we're looking for
                if (job._id === jobId) {
                  dispatch(updateTaskflowJobStatus(id, job._id));
                  if (updateLog) {
                    dispatch(getTaskflowJobLog(id, job._id));
                  }
                }
              });
            }
          })
          .catch((error) => {
            dispatch(netActions.errorNetworkCall(action.id, error));
            dispatch({ type: DELETE_TASKFLOW, id: action.id });
          });
      } // close if status is (!terminated && !complete)
    });
    return { type: 'NOOP' };
  };
}

// fetch tasks for each taskflow, the task objects which come back have log and status.
function findTask() {
  return dispatch => {
    const taskflows = store.getState().taskflows;
    Object.keys(taskflows.mapById).forEach(id => {
      if (taskflows.mapById[id].status !== 'complete' &&
          taskflows.mapById[id].status !== 'terminated') {
        dispatch(fetchTaskflowTasks(id));
      }
    });
    return { type: 'NOOP' };
  };
}

// updates taskflow.flow if the flow object has no meta.
// this is called when we get a cluster event for an unknown cluster
function updateTaskflowObject() {
  const state = store.getState();
  const taskflows = Object.keys(state.taskflows.mapById).map((key) => state.taskflows.mapById[key]);
  for (let i = 0; i < taskflows.length; i++) {
    if (!taskflows[i].flow.meta && taskflows[i].flow._id) {
      dispatch(fetchTaskflow(taskflows[i].flow._id));
    }
  }
  dispatch(clusterActions.fetchClusters(null));
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
    case 'profile': {
      return store.getState().preferences.clusters.mapById[id];
    }
    default: {
      return null;
    }
  }
}

function processStatusEvent(id, type, status) {
  const taskflowId = getTaskflowIdFromId(id, type);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${type} status ${status}`);
  }
  if (type === 'taskflow') {
    dispatch(updateTaskflowStatus(id, status));
  } else if (taskflowId) {
    switch (type) {
      case 'job':
        dispatch(updateTaskflowJobStatus(taskflowId, id, status));
        break;
      case 'task':
        dispatch(updateTaskflowTaskStatus(taskflowId, id, status));
        break;
      case 'cluster':
        if (status === 'created') {
          // we need to fetch some new cluster props when this happens
          dispatch(clusterActions.fetchCluster(id));
        }
        dispatch(clusterActions.updateClusterStatus(id, status));
        break;
      case 'profile':
        dispatch(clusterActions.updateClusterStatus(id, status));
        break;
      default:
        console.log(`unrecognized ServerEvent with type "${type}",` +
          ` taskflowId "${taskflowId}", and status "${status}"`);
        break;
    }
  } else {
    switch (type) {
      case 'job':
        // find and update job
        dispatch(findJob(id));
        break;
      case 'task':
        // update all tasks for each taskflow
        dispatch(findTask());
        break;
      case 'cluster':
        // update taskflow meta, fetch clusters
        updateTaskflowObject();
        break;
      case 'profile':
        dispatch(clusterActions.fetchClusters('ec2'));
        break;
      default:
        console.log(`unrecognized ServerEvent with type "${type}",` +
          ` id "${id}", and status "${status}"`);
    }
  }
}

function processLogEvent(id, type, log) {
  const taskflowId = getTaskflowIdFromId(id, type);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${type} log ${id}`);
  }
  if (type === 'taskflow') {
    dispatch(updateTaskflowLog(id, log));
  } else if (taskflowId) {
    switch (type) {
      case 'job':
        dispatch(updateTaskflowJobLog(taskflowId, id, log));
        break;
      case 'task':
        dispatch(updateTaskflowTaskLog(taskflowId, id, log));
        break;
      case 'cluster':
        dispatch(clusterActions.appendToClusterLog(id, log));
        break;
      default:
        console.log(`unrecognized ServerEvent with type "${type}",` +
          ` id "${id}", and log: `, log);
    }
  } else {
    switch (type) {
      case 'job':
        dispatch(findJob(id, true));
        break;
      case 'task':
        dispatch(findTask());
        break;
      case 'cluster':
        dispatch(clusterActions.fetchClusters(null));
        break;
      default:
        console.log(`unrecognized ServerEvent with type "${type}",` +
          ` id "${id}", and log: `, log);
    }
  }
}

client.onEvent((resp) => {
  const type = resp.type.split('.')[0];
  const id = resp.data._id;

  if (resp.data.status) {
    processStatusEvent(id, type, resp.data.status);
  } else if (resp.data.log) {
    processLogEvent(id, type, resp.data.log);
  }
});
