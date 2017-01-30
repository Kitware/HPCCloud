import * as Actions from '../actions/aws';
import deepClone    from 'mout/src/lang/deepClone';

export const initialState = {
  list: [],
  active: 0,
  pending: false,
  mapById: {},
};

export const awsTemplate = {
  accessKeyId: '',
  availabilityZone: 'us-east-1a',
  name: 'new AWS profile',
  regionName: 'us-east-1',
  secretAccessKey: '',
};

export default function awsReducer(state = initialState, action) {
  switch (action.type) {
    case Actions.ADD_AWS_PROFILE: {
      return Object.assign(
        {},
        state,
        {
          list: [].concat(state.list, deepClone(awsTemplate)),
          active: state.list.length,
        });
    }

    case Actions.REMOVE_AWS_PROFILE: {
      const list = state.list.filter((item, idx) => idx !== action.index);
      const aws = state.list.filter((item, idx) => idx === action.index)[0];
      const active = (state.active < list.length) ? state.active : (list.length - 1);
      const newState = Object.assign({}, state, { list, active });

      if (aws && aws._id && state.mapById[aws._id]) {
        const mapById = Object.assign({}, state.mapById);
        delete mapById[aws._id];
        return Object.assign(newState, { mapById });
      }
      return newState;
    }

    case Actions.UPDATE_ACTIVE_AWS_PROFILE: {
      const active = Math.min(Math.max(action.index, 0), state.list.length - 1);
      return Object.assign({}, state, { active });
    }

    case Actions.UPDATE_AWS_PROFILES: {
      const list = action.profiles;
      const active = (state.active < list.length) ? state.active : (list.length - 1);
      const mapById = {};
      list.forEach((aws) => {
        if (aws._id) {
          mapById[aws._id] = aws;
        }
      });
      return Object.assign({}, state, { list, active, mapById });
    }

    case Actions.SAVE_AWS_PROFILE: {
      const { index, profile } = action;

      const list = [].concat(
        state.list.slice(0, index),
        profile,
        state.list.slice(index + 1));
      const active = (state.active < list.length) ? state.active : (list.length - 1);

      if (profile._id) {
        const mapById = Object.assign({}, state.mapById, { [profile._id]: profile });
        return Object.assign({}, state, { list, active, mapById });
      }

      return Object.assign({}, state, { list, active });
    }

    case Actions.PENDING_AWS_NETWORK: {
      return Object.assign({}, state, { pending: action.pending });
    }

    default:
      return state;
  }
}
