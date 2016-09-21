import * as Actions from '../actions/projects';

export const simInitialState = {
  mapById: {},
};

export default function simulationsReducer(state = simInitialState, action) {
  switch (action.type) {
    case Actions.REMOVE_SIMULATION: {
      const mapById = Object.assign({}, state.mapById);
      delete mapById[action.simulation._id];
      return Object.assign({}, state, { mapById });
    }

    case Actions.UPDATE_SIMULATION: {
      const mapById = Object.assign({}, state.mapById);
      mapById[action.simulation._id] = action.simulation;
      return Object.assign({}, state, { mapById });
    }

    case Actions.UPDATE_PROJECT_SIMULATIONS: {
      const mapById = Object.assign({}, state.mapById);
      action.simulations.forEach(simulation => {
        mapById[simulation._id] = simulation;
      });
      return Object.assign({}, state, { mapById });
    }

    default:
      return state;
  }
}
