import * as Actions from '../actions/taskflows';

const initialState = {
  mapById: {},
  taskflowMapByTaskId: {},
  taskflowMapByJobId: {},
  updateLogs: [],
};

export default function taskflowsReducer(state = initialState, action) {
  switch (action.type) {
    case Actions.ADD_TASKFLOW: {
      const jobMapById = {};
      if (action.taskflow.meta && action.taskflow.meta.jobs) {
        action.taskflow.meta.jobs.forEach(job => {
          jobMapById[job._id] = job;
        });
      }
      const simulation = state.mapById[action.taskflow._id] ? state.mapById[action.taskflow._id].simulation : null;
      const mapById = Object.assign(
        {},
        state.mapById,
        { [action.taskflow._id]: {
          flow: action.taskflow,
          jobMapById,
          taskMapById: {},
          simulation,
        } });
      return Object.assign({}, state, { mapById });
    }

    case Actions.UPDATE_TASKFLOW_JOB_LOG: {
      const { taskflowId, jobId, log } = action;
      const taskflow = state.mapById[taskflowId];
      const job = Object.assign({}, taskflow.jobMapById[jobId], { log });
      const jobMapById = Object.assign({}, taskflow.jobMapById, { [jobId]: job });
      const newTaskflow = Object.assign({}, taskflow, { jobMapById });
      const mapById = Object.assign({}, state.mapById, { [taskflowId]: newTaskflow });

      return Object.assign({}, state, { mapById });
    }

    case Actions.UPDATE_TASKFLOW_JOB_STATUS: {
      const { taskflowId, jobId, status } = action;

      const taskflow = state.mapById[taskflowId];
      if (taskflow.taskMapById[jobId] && taskflow.taskMapById[jobId].status === status) {
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

      return Object.assign({}, state, { taskflowMapByTaskId, mapById });
    }

    case Actions.UPDATE_TASKFLOW_TASK_STATUS: {
      const { taskflowId, taskId, status } = action;

      const taskflow = state.mapById[taskflowId];
      if (taskflow.taskMapById[taskId] && taskflow.taskMapById[taskId].status === status) {
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
      const { simulationId, taskflowId } = action;

      const taskflow = Object.assign({}, state.mapById[taskflowId], { simulation: simulationId });
      const mapById = Object.assign({}, state.mapById, { [taskflowId]: taskflow });

      return Object.assign({}, state, { mapById });
    }

    case Actions.DELETE_TASKFLOW: {
      const { id } = action;

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

    default:
      return state;
  }
}
