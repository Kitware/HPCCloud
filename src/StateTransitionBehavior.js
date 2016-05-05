import * as ProjectActions  from './redux/actions/projects';
import * as TaskflowActions from './redux/actions/taskflows';
import * as FSActions       from './redux/actions/fs';
import Workflows            from './workflows';

import equals from 'mout/src/array/equals';
import { dispatch } from './redux';

const simulationsStatus = {};

function folderItemSize(state, folderId) {
  const folder = state.fs.folderMapById[folderId];
  if (folder) {
    const itemChildrenLength = folder.itemChildren ? folder.itemChildren : 0;
    const folderChildrenLength = folder.folderChildren ? folder.folderChildren : 0;
    return itemChildrenLength + folderChildrenLength;
  }
  return 0;
}

export function handleTaskflowChange(state, taskflow) {
  if (!taskflow) {
    return;
  }

  let primaryJob = taskflow.primaryJob;
  let jobs,
    tasks;
  const outputDirectory = [];
  const actions = [];
  try {
    jobs = Object.keys(taskflow.jobMapById).map(id => taskflow.jobMapById[id]);
    tasks = Object.keys(taskflow.taskMapById).map(id => taskflow.taskMapById[id]);
  } catch (e) {
    return;
  }
  const allComplete = jobs.every(job => job.status === 'complete') && tasks.every(task => task.status === 'complete');
  const simulationStatus = [];

  // Figure out possible actions and simulation state
  if (jobs.length && jobs.every(job => job.status === 'terminated')) {
    simulationStatus.push('terminated');
    actions.push('rerun');
  } else if (tasks.some(task => task.status === 'error') && (jobs.length === 0 || !jobs.some(job => job.status === 'running'))) {
    simulationStatus.push('terminated');
    actions.push('rerun');
  } else if (!allComplete && (jobs.length + tasks.length) > 0 && !jobs.some(job => job.status === 'terminating')) {
    simulationStatus.push('running');
    actions.push('terminate');
  } else if (allComplete) {
    simulationStatus.push('complete');
  }

  if (taskflow.simulation && state.simulations.mapById[taskflow.simulation]) {
    const simulation = state.simulations.mapById[taskflow.simulation];
    const project = state.projects.mapById[simulation.projectId];
    simulationStatus.push(simulation.metadata.status);

    // Update local store to figure out primaryJob of taskflow if not yet available
    if (!primaryJob && taskflow.stepName && project) {
      primaryJob = Workflows[project.type].primaryJobs[taskflow.stepName];
    }

    // Need to update simulation status
    if (simulationStatus.length === 2 && (simulationStatus[0] !== simulationStatus[1]) || simulationsStatus[simulation._id] !== simulationStatus[1]) {
      const metadata = Object.assign({}, simulation.metadata, { status: simulationStatus[0] });
      simulationsStatus[simulation._id] = simulationStatus[0];
      dispatch(ProjectActions.saveSimulation(Object.assign({}, simulation, { metadata })));
    }
  }

  // Extract output directory if any
  for (let i = 0; i < jobs.length; i++) {
    if (jobs[i].name === primaryJob) {
      outputDirectory.push(jobs[i].dir);
      break;
    }
  }

  // for taskflows on ec2 the meta object is not as readily available
  // this is due to fewer jobs coming through SSE which triggers a fetch for trad clusters.
  if (!taskflow.flow.meta) {
    dispatch(TaskflowActions.fetchTaskflow(taskflow.flow._id));
  } else {
    const tfClusterId = taskflow.flow.meta.cluster._id,
      tfCluster = state.preferences.clusters.mapById[tfClusterId];
    if (tfCluster && tfCluster.type === 'ec2' &&
      taskflow.flow.status !== 'running' &&
      ['running', 'error'].indexOf(tfCluster.status) !== -1) {
      actions.push('terminateInstance');
    }
  }

  // Update taslkfow meta
  if (allComplete !== taskflow.allComplete ||
    outputDirectory[0] !== taskflow.outputDirectory ||
    !equals(actions, taskflow.actions) ||
    primaryJob !== taskflow.primaryJob) {
    dispatch(TaskflowActions.updateTaskflowMetadata(taskflow.flow._id,
      { actions, allComplete, outputDirectory: outputDirectory[0], primaryJob }));

    // Update simulation folders when all tasks/jobs are done
    if (allComplete && taskflow.simulation && state.simulations.mapById[taskflow.simulation]) {
      const inputFolder = state.simulations.mapById[taskflow.simulation].metadata.inputFolder._id;
      const outputFolder = state.simulations.mapById[taskflow.simulation].metadata.outputFolder._id;
      // inputFolder is already a little populated on allComplete
      dispatch(FSActions.fetchFolder(inputFolder));
      // outputFolder is not, only get it once.
      if (folderItemSize(state, outputFolder) === 0) {
        dispatch(FSActions.fetchFolder(outputFolder));
      }
    }
  }
}
