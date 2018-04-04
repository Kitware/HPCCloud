import * as Actions from '../actions/statuses';

export const initialState = {
  ec2: [],
  clusters: [],
};

export default function statusesReducer(state = initialState, action) {
  switch (action.type) {
    case Actions.UPDATE_EC2_LIST: {
      return Object.assign({}, state, { ec2: action.list });
    }
    case Actions.UPDATE_CLUSTERS_LIST: {
      return Object.assign({}, state, { clusters: action.list });
    }
    default:
      return state;
  }
}
