import client           from '../../network';
import * as SimulationHelper from '../../network/helpers/simulations';
import * as ProjectHelper    from '../../network/helpers/projects';
import * as netActions  from './network';
import * as router          from './router';
import { dispatch }     from '../index.js';

export const FETCH_PROJECT_LIST = 'FETCH_PROJECT_LIST';
export const UPDATE_PROJECT_LIST = 'UPDATE_PROJECT_LIST';
export const UPDATE_PROJECT_SIMULATIONS = 'UPDATE_PROJECT_SIMULATIONS';
export const REMOVE_PROJECT = 'REMOVE_PROJECT';
export const UPDATE_PROJECT = 'UPDATE_PROJECT';
export const REMOVE_SIMULATION = 'REMOVE_SIMULATION';
export const UPDATE_ACTIVE_PROJECT = 'UPDATE_ACTIVE_PROJECT';
export const UPDATE_ACTIVE_SIMULATION = 'UPDATE_ACTIVE_SIMULATION';
export const UPDATE_SIMULATION = 'UPDATE_SIMULATION';

/* eslint-disable no-shadow */

// ----------------------------------------------------------------------------
// PROJECTS
// ----------------------------------------------------------------------------
export function updateProjectList(projects) {
  return { type: UPDATE_PROJECT_LIST, projects };
}

export function updateProjectSimulations(id, simulations) {
  return { type: UPDATE_PROJECT_SIMULATIONS, id, simulations };
}

export function fetchProjectSimulations(id) {
  return dispatch => {
    const action = netActions.addNetworkCall(`fetch_project_simulations_${id}`, 'Retreive project simulations');

    return client.listSimulations(id)
      .then((resp) => {
        const simulations = resp.data;
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateProjectSimulations(id, simulations));
      })
      .catch((error) => {
        dispatch(netActions.errorNetworkCall(action.id, error));
        throw new Error('sim fetch fails');
      });
  };
}

export function fetchProjectList() {
  return dispatch => {
    const action = netActions.addNetworkCall('fetch_project_list', 'Retreive projects');

    return client.listProjects()
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateProjectList(resp.data));
        resp.data.forEach(project => {
          dispatch(fetchProjectSimulations(project._id));
        });
      })
      .catch((error) => {
        dispatch(netActions.errorNetworkCall(action.id, error));
        throw new Error('proj fetch fails');
      });

    // return action;
  };
}

export function deleteProject(project) {
  return dispatch => {
    const action = netActions.addNetworkCall(`delete_project_${project._id}`, `Delete project ${project.name}`);

    return client.deleteProject(project._id)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch({ type: REMOVE_PROJECT, project });
          dispatch(router.push('/'));
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
          throw new Error('project delete fails');
        });
  };
}

export function setActiveProject(id, location) {
  return dispatch => {
    const updateActive = { type: UPDATE_ACTIVE_PROJECT, id };

    if (location) {
      dispatch(updateActive);
      return router.push(location);
    }
    return updateActive;
  };
}

export function updateProject(project) {
  return { type: UPDATE_PROJECT, project };
}

export function saveProject(project, attachments) {
  return dispatch => {
    const action = netActions.addNetworkCall('save_project', `Save project ${project.name}`);

    if (attachments && Object.keys(attachments).length) {
      dispatch(netActions.prepareUpload(attachments));
    }

    return ProjectHelper.saveProject(project, attachments)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          const respWithProj = Array.isArray(resp) ? resp[resp.length - 1] : resp;
          dispatch(updateProject(respWithProj.data));
          if (attachments && Object.keys(attachments).length) {
            setTimeout(() => { dispatch(router.push(`/View/Project/${respWithProj.data._id}`)); }, 1500);
          } else {
            dispatch(router.push(`/View/Project/${respWithProj.data._id}`));
          }
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });
  };
}

// ----------------------------------------------------------------------------
// SIMULATIONS
// ----------------------------------------------------------------------------

export function updateSimulation(simulation) {
  return { type: UPDATE_SIMULATION, simulation };
}

export function saveSimulation(simulation, attachments, location) {
  return dispatch => {
    const action = netActions.addNetworkCall('save_simulation', `Save simulation ${simulation.name}`);

    if (attachments && Object.keys(attachments).length) {
      dispatch(netActions.prepareUpload(attachments));
    }

    SimulationHelper.saveSimulation(simulation, attachments)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          const respWithSim = Array.isArray(resp) ? resp[resp.length - 1] : resp;
          dispatch(updateSimulation(respWithSim.data));
          if (location && attachments && Object.keys(attachments).length) {
            // in this 1.5s gap the progressBar will appear complete, and fade on the new page
            setTimeout(() => { dispatch(router.push(location)); }, 1500);
          } else if (location) {
            // `/View/Project/${respWithSim.data.projectId}`
            dispatch(router.push(location));
          }
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function deleteSimulation(simulation, location) {
  return dispatch => {
    const action = netActions.addNetworkCall(`delete_simulation_${simulation._id}`, `Delete simulation ${simulation.name}`);

    return client.deleteSimulation(simulation._id)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch({ type: REMOVE_SIMULATION, simulation });
          if (location) {
            dispatch(router.replace(location));
          }
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
          // throw new Error('project delete fails');
        });

    // return action;
  };
}

export function setActiveSimulation(id, location) {
  return dispatch => {
    const updateActive = { type: UPDATE_ACTIVE_SIMULATION, id };

    if (location) {
      dispatch(updateActive);
      return router.push(location);
    }
    return updateActive;
  };
}

export function updateSimulationStep(id, stepName, data, location) {
  return dispatch => {
    const action = netActions.addNetworkCall(`update_simulation_step_${id}`, 'Update simulation step');

    return client.updateSimulationStep(id, stepName, data)
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateSimulation(resp.data));
        if (location) {
          dispatch(router.replace(location));
        }
      })
      .catch((error) => {
        dispatch(netActions.errorNetworkCall(action.id, error));
      });
  };
}

// Auto trigger actions on authentication change...
client.onAuthChange(authenticated => {
  if (authenticated) {
    dispatch(fetchProjectList());
  } else {
    dispatch(updateProjectList([]));
  }
});
