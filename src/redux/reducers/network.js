import * as Actions from '../actions/network';

const initialState = {
  pending: {},
  success: {},
  error: {},
  backlog: [],
};

export default function networkReducer(state = initialState, action) {
  switch (action.type) {

    case Actions.ADD_NETWORK_CALL: {
      const { id, label, progress, ts } = action;
      const pending = Object.assign({}, state.pending, { [id]: { id, label, progress, ts } });
      const success = Object.assign({}, state.success);
      const error = Object.assign({}, state.error);
      const backlog = [].concat(state.backlog, success[id], error[id]).filter(el => !!el);
      delete success[id];
      delete error[id];

      return Object.assign({}, { pending, success, error, backlog });
    }

    case Actions.SUCCESS_NETWORK_CALL: {
      if (!state.pending[action.id]) {
        // FIXME: strange behavior where action.id is null
        return state;
      }
      const pending = Object.assign({}, state.pending);
      const callToMove = Object.assign({}, pending[action.id], { resp: action.resp });
      const success = Object.assign({}, state.success, { [action.id]: callToMove });
      delete pending[action.id];
      return Object.assign({}, state, { pending, success });
    }

    case Actions.ERROR_NETWORK_CALL: {
      const pending = Object.assign({}, state.pending);
      const callToMove = Object.assign({}, pending[action.id], { resp: action.resp });
      const error = Object.assign({}, state.error, { [action.id]: callToMove });
      delete pending[action.id];

      return Object.assign({}, state, { pending, error });
    }

    case Actions.PROGRESS_NETWORK_CALL: {
      const item = Object.assign({}, state.pending[action.id], { progress: action.progress });
      const pending = Object.assign({}, state.pending, { [action.id]: item });
      return Object.assign({}, state, { pending });
    }

    default:
      return state;
  }
}
