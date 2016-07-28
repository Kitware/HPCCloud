import * as Actions from '../actions/taskflows';
// import logSort from '../../utils/logSort';

export const initialState = {
  pending: [],
  mapById: {},
  taskflowMapByTaskId: {},
  taskflowMapByJobId: {},
  updateLogs: [],
};

export const taskflowTemplate = {
  taskMapById: {},
  log: [],
  actions: [],
};

export default function taskflowsReducer(state = initialState, action) {
  switch (action.type) {
    case Actions.ADD_TASKFLOW: {
      const jobMapById = {};
      const log = action.taskflow.log || [];
      if (action.taskflow.meta && action.taskflow.meta.jobs) {
        action.taskflow.meta.jobs.forEach(job => {
          jobMapById[job._id] = job;
          // Keep the previous status if available
          if (state.mapById[action.taskflow._id] && state.mapById[action.taskflow._id].jobMapById && state.mapById[action.taskflow._id].jobMapById[job._id]) {
            jobMapById[job._id].status = state.mapById[action.taskflow._id].jobMapById[job._id].status;
          }
        });
      }
      const taskflow = Object.assign(
        {},
        taskflowTemplate,
        state.mapById[action.taskflow._id],
        {
          flow: action.taskflow,
          primaryJob: action.primaryJob,
          jobMapById,
          log,
        });
      const mapById = Object.assign(
        {},
        state.mapById,
        { [action.taskflow._id]: taskflow });
      return Object.assign({}, state, { mapById });
    }

    case Actions.PENDING_TASKFLOW_NETWORK: {
      const { isPending, taskflowId } = action;
      const pending = [].concat(state.pending);
      if (isPending) {
        pending.push(taskflowId);
      } else {
        pending.splice(pending.indexOf(taskflowId), 1);
      }
      return Object.assign({}, state, { pending });
    }

    case Actions.TRIGGER_UPDATE: {
      const updateLogs = [].concat(state.updateLogs, action.taskflowId);
      return Object.assign({}, state, { updateLogs });
    }

    // appends a new log entry to the taskflow log
    case Actions.UPDATE_TASKFLOW_LOG: {
      const mapById = Object.assign({}, state.mapById);
      const taskflow = Object.assign({}, state.mapById[action.taskflowId]);
      if (!taskflow.log) {
        taskflow.log = [];
      }
      taskflow.log.push(action.logEntry);
      mapById[action.taskflowId] = taskflow;

      return Object.assign({}, state, { mapById });
    }

    // creates a log from GET/taskflow/{id}/log
    case Actions.GET_TASKFLOW_LOG: {
      const newLog = action.log;
      const mapById = Object.assign({}, state.mapById);
      const taskflow = Object.assign({}, state.mapById[action.taskflowId]);
      taskflow.log = newLog;
      mapById[action.taskflowId] = taskflow;

      return Object.assign({}, state, { mapById });
    }

    case Actions.CLEAR_UPDATE_LOG: {
      return Object.assign({}, state, { updateLogs: [] });
    }

    case Actions.UPDATE_TASKFLOW_STATUS: {
      const status = action.status;
      const mapById = Object.assign({}, state.mapById);
      const taskflow = Object.assign({}, mapById[action.id]);
      const flow = Object.assign({}, taskflow.flow);
      flow.status = status;
      taskflow.flow = flow;
      mapById[action.id] = taskflow;
      return Object.assign({}, state, { mapById });
    }

    case Actions.UPDATE_TASKFLOW_JOB_LOG: {
      const { taskflowId, jobId, logEntry } = action;
      const taskflow = state.mapById[taskflowId];
      const job = Object.assign({}, taskflow.jobMapById[jobId]);
      job.log.push(logEntry);
      const jobMapById = Object.assign({}, taskflow.jobMapById, { [jobId]: job });
      const newTaskflow = Object.assign({}, taskflow, { jobMapById });
      const mapById = Object.assign({}, state.mapById, { [taskflowId]: newTaskflow });

      return Object.assign({}, state, { mapById });
    }

    // fetches and upates a full taskflow job log
    case Actions.GET_TASKFLOW_JOB_LOG: {
      const { taskflowId, jobId, log } = action;
      const taskflow = state.mapById[taskflowId];
      const job = Object.assign({}, taskflow.jobMapById[jobId], { log });
      const jobMapById = Object.assign({}, taskflow.jobMapById, { [jobId]: job });
      const newTaskflow = Object.assign({}, taskflow, { jobMapById });
      const mapById = Object.assign({}, state.mapById, { [taskflowId]: newTaskflow });

      return Object.assign({}, state, { mapById });
    }

    // updates a job log with a single log entry
    case Actions.UPDATE_TASKFLOW_TASK_LOG: {
      const { taskflowId, taskId, logEntry } = action;
      const taskflow = state.mapById[taskflowId];
      const task = Object.assign({}, taskflow.taskMapById[taskId]);
      task.log.push(logEntry);
      const taskMapById = Object.assign({}, taskflow.taskMapById, { [taskId]: task });
      const newTaskflow = Object.assign({}, taskflow, { taskMapById });
      const mapById = Object.assign({}, state.mapById, { [taskflowId]: newTaskflow });

      return Object.assign({}, state, { mapById });
    }

    case Actions.UPDATE_TASKFLOW_JOB_STATUS: {
      const { taskflowId, jobId, status } = action;

      const taskflow = state.mapById[taskflowId];
      if (taskflow.jobMapById[jobId] && taskflow.jobMapById[jobId].status === status) {
        // console.log('job status skip', taskflow.allComplete, Object.keys(taskflow.jobMapById).map(id => taskflow.jobMapById[id].status));
        return state;
      }

      const job = Object.assign({}, taskflow.jobMapById[jobId], { status });
      const jobMapById = Object.assign({}, taskflow.jobMapById, { [jobId]: job });
      const newTaskflow = Object.assign({}, taskflow, { jobMapById });
      const mapById = Object.assign({}, state.mapById, { [taskflowId]: newTaskflow });
      if (state.updateLogs.indexOf(taskflowId) === -1) {
        const updateLogs = [].concat(state.updateLogs, taskflowId);
        return Object.assign({}, state, { mapById, updateLogs });
      }

      return Object.assign({}, state, { mapById });
    }

    case Actions.UPDATE_TASKFLOW_TASKS: {
      const { taskflowId, tasks } = action;
      const taskMapById = {};
      const taskflowMapByTaskId = Object.assign({}, state.taskflowMapByTaskId);
      tasks.forEach(task => {
        taskMapById[task._id] = task;
        taskflowMapByTaskId[task._id] = taskflowId;
      });
      const task = Object.assign({}, state.mapById[taskflowId], { taskMapById });
      const mapById = Object.assign({}, state.mapById, { [taskflowId]: task });

      if (state.updateLogs.indexOf(taskflowId) === -1) {
        const updateLogs = [].concat(state.updateLogs, taskflowId);
        return Object.assign({}, state, { taskflowMapByTaskId, mapById, updateLogs });
      }
      return Object.assign({}, state, { taskflowMapByTaskId, mapById });
    }

    case Actions.UPDATE_TASKFLOW_TASK_STATUS: {
      const { taskflowId, taskId, status } = action;

      const taskflow = state.mapById[taskflowId];
      if (taskflow.taskMapById[taskId] && taskflow.taskMapById[taskId].status === status) {
        // console.log('task status skip', taskflow.allComplete, Object.keys(taskflow.taskMapById).map(id => taskflow.taskMapById[id].status));
        return state;
      }

      const task = Object.assign({}, taskflow.taskMapById[taskId], { status });
      const taskMapById = Object.assign({}, taskflow.taskMapById, { [taskId]: task });
      const newTaskflow = Object.assign({}, taskflow, { taskMapById });
      const mapById = Object.assign({}, state.mapById, { [taskflowId]: newTaskflow });
      if (state.updateLogs.indexOf(taskflowId) === -1) {
        const updateLogs = [].concat(state.updateLogs, taskflowId);
        return Object.assign({}, state, { mapById, updateLogs });
      }

      return Object.assign({}, state, { mapById });
    }

    case Actions.BIND_SIMULATION_TO_TASKFLOW: {
      const { simulationId, taskflowId, stepName } = action;

      const taskflow = Object.assign({}, state.mapById[taskflowId], { simulation: simulationId, stepName });
      const mapById = Object.assign({}, state.mapById, { [taskflowId]: taskflow });

      return Object.assign({}, state, { mapById });
    }

    case Actions.DELETE_TASKFLOW: {
      const id = action.id;

      const taskflowMapByTaskId = {};
      Object.keys(state.taskflowMapByTaskId).forEach((key) => {
        if (state.taskflowMapByTaskId[key] !== id) {
          taskflowMapByTaskId[key] = state.taskflowMapByTaskId[key];
        }
      });

      const taskflowMapByJobId = {};
      Object.keys(state.taskflowMapByJobId).forEach((key) => {
        if (state.taskflowMapByJobId[key] !== id) {
          taskflowMapByJobId[key] = state.taskflowMapByJobId[key];
        }
      });

      const mapById = Object.assign({}, state.mapById);

      delete mapById[id];
      return Object.assign({}, state, { mapById, taskflowMapByTaskId, taskflowMapByJobId });
    }

    case Actions.UPDATE_TASKFLOW_METADATA: {
      const { id, metadata } = action;
      const mapById = Object.assign({}, state.mapById);
      mapById[id] = Object.assign({}, mapById[id], metadata);
      return Object.assign({}, state, { mapById });
    }

    default:
      return state;
  }
}
