import * as Actions from '../actions/network';

const initialState = {
  pending: {},
  success: {},
  error: {},
  activeErrors: [],
  backlog: [],
  errorTimeout: null,
  progress: {},
  progressReset: false,
};

export default function networkReducer(state = initialState, action) {
  switch (action.type) {

    case Actions.ADD_NETWORK_CALL: {
      const { id, label, ts } = action;
      const pending = Object.assign({}, state.pending, { [id]: { id, label, ts } });
      const success = Object.assign({}, state.success);
      const error = Object.assign({}, state.error);
      const backlog = [].concat(state.backlog, success[id], error[id]).filter(el => !!el);
      delete success[id];
      delete error[id];

      return Object.assign({}, state, { pending, success, error, backlog });
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
      const callToMove = Object.assign({}, pending[action.id], { resp: action.resp, invalid: false });
      const error = Object.assign({}, state.error, { [action.id]: callToMove });
      const activeErrors = [action.id].concat(state.activeErrors);
      delete pending[action.id];

      if (action.errorTimeout && state.errorTimeout !== null) {
        clearTimeout(state.errorTimeout);
      }

      return Object.assign({}, state, { pending, error, errorTimeout: action.errorTimeout, activeErrors });
    }

    case Actions.INVALIDATE_ERROR: {
      const id = action.id;
      const error = Object.assign({}, state.error);
      const activeErrors = [].concat(state.activeErrors);
      activeErrors.splice(activeErrors.indexOf(action.id), 1);

      if (error[id].resp.data.message) {
        error[id].invalid = true;
      }

      return Object.assign({}, state, { error, errorTimeout: null, activeErrors });
    }

    case Actions.INVALIDATE_ERRORS: {
      const ids = action.ids;
      const error = Object.assign({}, state.error);

      ids.forEach((id) => {
        if (error[id]) {
          error[id].invalid = true;
        }
      });

      return Object.assign({}, state, { error });
    }

    case Actions.PREPARE_UPLOAD: {
      const files = action.files;
      const progress = {};
      Object.keys(files).forEach((key, index) => {
        progress[`${files[key].name}_${files[key].lastModified}`] = { current: 0, total: files[key].size };
      });
      return Object.assign({}, state, { progress });
    }

    case Actions.RESET_PROGRESS: {
      return Object.assign({}, state, { progress: {}, progressReset: action.val });
    }

    case Actions.ON_PROGRESS: {
      const progress = Object.assign({}, state.progress);
      const progressItem = Object.assign({}, progress[action.progressPacket.id]);
      progressItem.current = action.progressPacket.current;
      progress[action.progressPacket.id] = progressItem;
      return Object.assign({}, state, { progress });
    }

    default:
      return state;
  }
}
