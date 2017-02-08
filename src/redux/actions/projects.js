import client                from '../../network';
import * as SimulationHelper from '../../network/helpers/simulations';
import * as ProjectHelper    from '../../network/helpers/projects';
import * as netActions       from './network';
import * as taskflowActions  from './taskflows';
import * as router           from './router';
import get                   from '../../utils/get';
import { store, dispatch }   from '../';

export const FETCH_PROJECT_LIST = 'FETCH_PROJECT_LIST';
export const UPDATE_PROJECT_LIST = 'UPDATE_PROJECT_LIST';
export const UPDATE_PROJECT_SIMULATIONS = 'UPDATE_PROJECT_SIMULATIONS';
export const REMOVE_PROJECT = 'REMOVE_PROJECT';
export const UPDATE_PROJECT = 'UPDATE_PROJECT';
export const INC_PROJECT_SIM_COUNT = 'INC_PROJECT_SIM_COUNT';
export const DEC_PROJECT_SIM_COUNT = 'DEC_PROJECT_SIM_COUNT';
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
  return (dispatch) => {
    const action = netActions.addNetworkCall(`fetch_project_simulations_${id}`, 'Retreive project simulations');

    client.listSimulations(id)
      .then((resp) => {
        const simulations = resp.data;
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateProjectSimulations(id, simulations));
      })
      .catch((error) => {
        dispatch(netActions.errorNetworkCall(action.id, error));
      });

    return action;
  };
}

export function fetchProjectList() {
  return (dispatch) => {
    const action = netActions.addNetworkCall('fetch_project_list', 'Retreive projects');

    client.listProjects()
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateProjectList(resp.data));
        resp.data.forEach((project) => {
          dispatch(fetchProjectSimulations(project._id));
        });
      })
      .catch((error) => {
        dispatch(netActions.errorNetworkCall(action.id, error));
      });

    return action;
  };
}

export function deleteProject(project) {
  return (dispatch) => {
    const action = netActions.addNetworkCall('delete_project', `Delete project ${project.name}`);

    client.deleteProject(project._id)
      .then(
        (resp) => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch({ type: REMOVE_PROJECT, project });
          dispatch(router.push('/'));
        },
        (error) => {
          dispatch(netActions.errorNetworkCall(action.id, error));
        });

    return action;
  };
}

export function setActiveProject(id, location) {
  return (dispatch) => {
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
  return (dispatch) => {
    const action = netActions.addNetworkCall('save_project', `Save project ${project.name}`);

    if (attachments && Object.keys(attachments).length) {
      dispatch(netActions.prepareUpload(attachments));
    }

    ProjectHelper.saveProject(project, attachments)
      .then(
        (resp) => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          const respWithProj = Array.isArray(resp) ? resp[resp.length - 1] : resp;
          dispatch(updateProject(respWithProj.data));
          if (attachments && Object.keys(attachments).length) {
            setTimeout(() => { dispatch(router.push(`/View/Project/${respWithProj.data._id}`)); }, 1500);
          } else {
            dispatch(router.push(`/View/Project/${respWithProj.data._id}`));
          }
        },
        (error) => {
          dispatch(netActions.errorNetworkCall(action.id, error, 'form'));
        });

    return action;
  };
}

export function shareProject(_id, users, groups) {
  return (dispatch) => {
    const action = netActions.addNetworkCall('share_project', `Share project users: ${users}\ngroups: ${groups}`);
    client.shareProject(_id, users, groups)
      .then(
        (resp) => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(updateProject(resp.data));
        },
        (error) => {
          dispatch(netActions.errorNetworkCall(action.id, error, 'form'));
        });
    return action;
  };
}

export function unShareProject(_id, users, groups) {
  return (dispatch) => {
    const action = netActions.addNetworkCall('unshare_project', `Unshare project users: ${users}\ngroups: ${groups}`);
    client.unShareProject(_id, users, groups)
      .then(
        (resp) => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(updateProject(resp.data));
        },
        (error) => {
          dispatch(netActions.errorNetworkCall(action.id, error, 'form'));
        });
    return action;
  };
}

// ----------------------------------------------------------------------------
// SIMULATIONS
// ----------------------------------------------------------------------------

export function updateSimulation(simulation) {
  return { type: UPDATE_SIMULATION, simulation };
}

export function saveSimulation(simulation, attachments, location) {
  return (dispatch) => {
    const action = netActions.addNetworkCall('save_simulation', `Save simulation ${simulation.name}`);

    if (attachments && Object.keys(attachments).length) {
      dispatch(netActions.prepareUpload(attachments));
    }

    SimulationHelper.saveSimulation(simulation, attachments)
      .then(
        (resp) => {
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
        (error) => {
          dispatch(netActions.errorNetworkCall(action.id, error, 'form'));
        });
    return action;
  };
}

function getTaskflowsFromSimulation(simulation) {
  const ret = [];
  Object.keys(simulation.steps).forEach((stepName) => {
    if (get(simulation.steps[stepName], 'metadata.taskflowId')) {
      ret.push(simulation.steps[stepName].metadata.taskflowId);
    }
  });
  return ret;
}

export function deleteSimulation(simulation, location) {
  return (dispatch) => {
    const action = netActions.addNetworkCall(`delete_simulation_${simulation._id}`, `Delete simulation ${simulation.name}`);
    const simStepTaskflows = getTaskflowsFromSimulation(simulation);
    client.deleteSimulation(simulation._id)
      .then(
        (resp) => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch({ type: REMOVE_SIMULATION, simulation });
          if (location) {
            dispatch(router.replace(location));
          }
          if (simStepTaskflows.length) {
            simStepTaskflows.forEach((taskflowId) => {
              dispatch(taskflowActions.deleteTaskflow(taskflowId));
            });
          }
        },
        (error) => {
          dispatch(netActions.errorNetworkCall(action.id, error, 'form'));
        });

    return action;
  };
}

export function patchSimulation(simulation) {
  return (dispatch) => {
    const action = netActions.addNetworkCall(`update_simulation_${simulation._id}`, `update simulation ${simulation.name}`);
    client.editSimulation(simulation)
      .then((resp) => {
        dispatch(netActions.successNetworkCall(action.id, resp));
        dispatch(updateSimulation(resp.data));
      })
      .catch((error) => {
        dispatch(netActions.errorNetworkCall(action.id, error));
      });
    return action;
  };
}

export function setActiveSimulation(id, location) {
  return (dispatch) => {
    const updateActive = { type: UPDATE_ACTIVE_SIMULATION, id };

    if (location) {
      dispatch(updateActive);
      return router.push(location);
    }
    return updateActive;
  };
}

export function updateSimulationStep(id, stepName, data, location) {
  return (dispatch) => {
    const action = netActions.addNetworkCall(`update_simulation_step_${id}`, 'Update simulation step');
    const state = store.getState().simulations.mapById[id];
    const stateTaskflowId = get(state, `steps.${stepName}.metadata.taskflowId`);

    if (stateTaskflowId && stateTaskflowId !== get(data, 'metadata.taskflowId')) {
      dispatch(taskflowActions.deleteTaskflow(stateTaskflowId));
    }

    client.updateSimulationStep(id, stepName, data)
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

    return action;
  };
}

export function shareSimulation(_id, users, groups) {
  return (dispatch) => {
    const action = netActions.addNetworkCall('share_simulation', `Share simulation users: ${users}\ngroups: ${groups}`);
    client.shareSimulation(_id, users, groups)
      .then(
        (resp) => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(updateSimulation(resp.data));
        },
        (error) => {
          dispatch(netActions.errorNetworkCall(action.id, error, 'form'));
        });
    return action;
  };
}

export function unShareSimulation(_id, users, groups) {
  return (dispatch) => {
    const action = netActions.addNetworkCall('unshare_simulation', `Share simulation users: ${users}\ngroups: ${groups}`);
    client.unshareSimulation(_id, users, groups)
      .then(
        (resp) => {
          dispatch(netActions.successNetworkCall(action.id, resp));
          dispatch(updateSimulation(resp.data));
        },
        (error) => {
          dispatch(netActions.errorNetworkCall(action.id, error, 'form'));
        });
    return action;
  };
}

// Auto trigger actions on authentication change...
client.onAuthChange((authenticated) => {
  if (authenticated) {
    dispatch(fetchProjectList());
  } else {
    dispatch(updateProjectList([]));
  }
});
