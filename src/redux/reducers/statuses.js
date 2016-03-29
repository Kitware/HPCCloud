import * as Actions from '../actions/statuses';

const initialState = {
  list: [
    { name: 'EC2' },
    { name: 'Clusters' },
  ],
  active: 0,
  activeData: [],
  pending: false,
};

export default function statusesReducer(state = initialState, action) {
  switch (action.type) {
    case Actions.UPDATE_ACTIVE_TYPE: {
      return Object.assign(
        {},
        state,
        { active: action.index });
    }
    case Actions.UPDATE_STATUS_LIST: {
      return Object.assign(
        {},
        state,
        { activeData: action.list });
    }
    default:
      return state;
  }
}
