import * as Actions from '../actions/progress';

export const initialState = {
  current: 0,
  total: null,
  progressReset: false,
};

export default function progressReducer(state = initialState, action) {
  switch (action.type) {
    case Actions.SETUP_PROGRESS: {
      return { current: 0, total: action.total };
    }
    case Actions.ON_SOME_PROGRESS: {
      return Object.assign({}, state, { current: action.current });
    }
    case Actions.RESET_PROGRESS: {
      return { current: 0, total: null, progressReset: action.val };
    }

    default:
      return state;
  }
}
