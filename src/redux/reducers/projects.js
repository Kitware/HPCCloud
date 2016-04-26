import * as Actions from '../actions/projects';
import { workflowNames } from 'workflows'; // alias
import Helper       from './ListActiveMapByIdHelper';

export const initialState = {
  list: [],
  active: null,
  mapById: {},
  simulations: {},
  workflowNames,
};

export default function projectsReducer(state = initialState, action) {
  switch (action.type) {
    case Actions.UPDATE_PROJECT_LIST: {
      return Helper.updateList(state, action.projects);
    }

    case Actions.REMOVE_PROJECT: {
      return Helper.removeItem(state, action.project._id);
    }

    case Actions.UPDATE_PROJECT: {
      return Helper.updateItem(state, action.project);
    }

    case Actions.UPDATE_ACTIVE_PROJECT: {
      return Helper.updateActive(state, action.id);
    }

    case Actions.UPDATE_PROJECT_SIMULATIONS: {
      const id = action.id;
      const simulations = Object.assign({}, state.simulations);
      const sim = simulations[id] || Helper.initialState;
      simulations[id] = Helper.updateList(sim, action.simulations);

      // Simulation map is kept somewhere else
      delete simulations[id].mapById;

      if (state.pendingActiveSimulation && simulations[id].list.indexOf(state.pendingActiveSimulation) !== -1) {
        simulations[id] = Helper.updateActive(simulations[id], state.pendingActiveSimulation);
        const coreState = Helper.updateActive(state, id);
        delete coreState.pendingActiveSimulation;
        return Object.assign({}, coreState, { simulations });
      }

      return Object.assign({}, state, { simulations });
    }

    case Actions.REMOVE_SIMULATION: {
      const id = action.simulation.projectId;
      const simulations = Object.assign({}, state.simulations);
      const sims = simulations[id] || Helper.initialState;
      simulations[id] = Helper.removeItem(sims, action.simulation._id);

      // Simulation map is kept somewhere else
      delete simulations[id].mapById;

      return Object.assign({}, state, { simulations });
    }

    case Actions.UPDATE_ACTIVE_SIMULATION: {
      const id = state.active;
      const simulations = Object.assign({}, state.simulations);
      const sims = simulations[id] || Helper.initialState;
      if (sims.list.indexOf(action.id) === -1) {
        return Object.assign({}, state, { pendingActiveSimulation: action.id });
      }
      simulations[id] = Helper.updateActive(sims, action.id);

      // Simulation map is kept somewhere else
      delete simulations[id].mapById;

      return Object.assign({}, state, { simulations });
    }

    case Actions.UPDATE_SIMULATION: {
      const id = action.simulation.projectId;
      const projects = Object.assign({}, state);
      const pMap = Object.assign({}, state.mapById);
      const project = Object.assign({}, state.mapById[id]);
      const pMeta = Object.assign({}, project.metadata);

      const simulations = Object.assign({}, state.simulations);
      const sims = simulations[id] || Helper.initialState;
      simulations[id] = Helper.updateItem(sims, action.simulation);

      pMeta.simulations = projects.simulations[id].list.length;
      project.metadata = pMeta;
      pMap[id] = project;
      projects.mapById = pMap;

      // Simulation map is kept somewhere else
      delete simulations[id].mapById;

      return Object.assign({}, state, { simulations, projects });
    }

    default:
      return state;
  }
}
