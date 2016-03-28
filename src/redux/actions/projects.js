import client           from '../../network';
import * as netActions  from './network';
import { dispatch }     from '../index.js';

import * as router      from './router';

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

export function updateProjectList(projects) {
  return { type: UPDATE_PROJECT_LIST, projects };
}

export function updateProjectSimulations(id, simulations) {
  return { type: UPDATE_PROJECT_SIMULATIONS, id, simulations };
}

export function fetchProjectSimulations(id) {
  return dispatch => {
    const action = netActions.addNetworkCall(`fetch_project_simulations_${id}`, 'Retreive project simulations');

    client.getProjectSimulations(id)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(updateProjectSimulations(id, resp.data));
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function fetchProjectList() {
  return dispatch => {
    const action = netActions.addNetworkCall('fetch_project_list', 'Retreive projects');

    client.listProjects()
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(updateProjectList(resp.data));
          resp.data.forEach(project => {
            dispatch(fetchProjectSimulations(project._id));
          });
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function deleteProject(project) {
  return dispatch => {
    const action = netActions.addNetworkCall(`delete_project_${project._id}`, `Delete project ${project.name}`);

    client.deleteProject(project._id)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch({ type: REMOVE_PROJECT, project });
          dispatch(router.push('/'));
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function updateProject(project) {
  return { type: UPDATE_PROJECT, project };
}

export function updateSimulation(simulation) {
  return { type: UPDATE_SIMULATION, simulation };
}

export function saveProject(project, attachements) {
  return dispatch => {
    const action = netActions.addNetworkCall('save_project', `Save project ${project.name}`);

    client.saveProject(project, attachements)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          const respWithProj = Array.isArray(resp) ? resp[resp.length - 1] : resp;
          dispatch(updateProject(respWithProj.data));
          dispatch(router.push(`/View/Project/${respWithProj.data._id}`));
        },
        error => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function saveSimulation(simulation, attachements) {
  return dispatch => {
    const action = netActions.addNetworkCall('save_simulation', `Save simulation ${simulation.name}`);

    client.saveSimulation(simulation, attachements)
      .then(
        resp => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          const respWithSim = Array.isArray(resp) ? resp[resp.length - 1] : resp;
          dispatch(updateSimulation(respWithSim.data));
          dispatch(router.push(`/View/Project/${respWithSim.data.projectId}`));
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

    client.deleteSimulation(simulation._id)
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
        });

    return action;
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

// Auto trigger actions on authentication change...
client.onAuthChange(authenticated => {
  if (authenticated) {
    dispatch(fetchProjectList());
  } else {
    dispatch(updateProjectList([]));
  }
});
