import * as Actions from '../actions/aws';
import deepClone    from 'mout/src/lang/deepClone';

const initialState = {
  list: [],
  active: 0,
  pending: false,
};

const template = {
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
          list: [].concat(state.list, deepClone(template)),
          active: state.list.length,
        });
    }

    case Actions.REMOVE_AWS_PROFILE: {
      const list = state.list.splice(action.index, 1);
      const active = (state.active < list.length) ? state.active : (list.length - 1);
      return Object.assign({}, state, { list, active });
    }

    case Actions.UPDATE_ACTIVE_AWS_PROFILE: {
      return Object.assign(
        {},
        state,
        { active: action.index });
    }

    case Actions.UPDATE_AWS_PROFILES: {
      const list = action.profiles;
      const active = (state.active < list.length) ? state.active : (list.length - 1);
      const newState = Object.assign({}, state, { list, active });
      return newState;
    }

    case Actions.SAVE_AWS_PROFILE: {
      const { index, profile } = action;

      const list = [].concat(
        state.list.slice(0, index),
        profile,
        state.list.slice(index + 1));
      const active = (state.active < list.length) ? state.active : (list.length - 1);

      return Object.assign({}, state, { list, active });
    }

    case Actions.PENDING_AWS_NETWORK: {
      return Object.assign({}, state, { pending: action.pending });
    }

    default:
      return state;
  }
}
