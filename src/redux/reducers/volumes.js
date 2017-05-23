import * as Actions from '../actions/volumes';
import deepClone    from 'mout/src/lang/deepClone';

export const initialState = {
  list: [],
  active: 0,
  pending: false,
  mapById: {},
  logById: {},
  mapByClusterId: {},
};

export const volumeTemplate = {
  name: 'new volume',
  size: 4,
  profileId: '',
  type: 'ebs',
  cluster: null,
};

export default function volumesReducer(state = initialState, action) {
  switch (action.type) {
    case Actions.ADD_VOLUME: {
      const newVol = deepClone(volumeTemplate);
      newVol.profileId = action.profileId;
      return Object.assign({}, state, {
        list: [].concat(state.list, newVol),
        active: state.list.length,
      });
    }
    case Actions.UPDATE_ACTIVE_VOLUME: {
      return Object.assign({}, state, { active: action.active });
    }
    case Actions.REMOVE_VOLUME: {
      const list = state.list.filter((item, idx) => idx !== action.index);
      const active = (state.active < list.length) ? state.active : (list.length - 1);

      const newState = Object.assign({}, state, { list, active });
      return newState;
    }
    case Actions.UPDATE_VOLUMES: {
      const list = action.volumes;
      const active = (state.active < list.length) ? state.active : (list.length - 1);
      const mapById = {};
      const mapByClusterId = {};
      list.forEach(vol => {
        if (vol._id) {
          mapById[vol._id] = Object.assign({}, vol, volumeTemplate);
          if (vol.clusterId) {
            mapByClusterId[vol.clusterId] = vol._id;
          }
        }
      });
      return Object.assign({}, state, { list, active, mapById, mapByClusterId });
    }
    // unused
    // case Actions.UPDATE_VOLUME: {
    //   console.log('todo');
    //   return state;
    // }
    case Actions.UPDATE_VOLUME_STATUS: {
      const newState = Object.assign({}, state);
      newState.mapById[action.volumeId].status = action.status;
      return newState;
    }
    case Actions.SAVE_VOLUME: {
      const { index, volume } = action;

      const list = [].concat(
        state.list.slice(0, index),
        volume,
        state.list.slice(index + 1));
      const active = (state.active < list.length) ? state.active : (list.length - 1);

      if (volume._id) {
        const mapById = Object.assign({}, state.mapById, { [volume._id]: volume });
        return Object.assign({}, state, { list, active, mapById });
      }

      return Object.assign({}, state, { list, active });
    }

    case Actions.APPEND_TO_VOLUME_LOG: {
      const logById = Object.assign({}, state.logById);
      let volumeLog = [].concat(state.logById[action.id]);
      if (!volumeLog) {
        volumeLog = [];
      }
      if (Array.isArray(action.logEntry)) {
        volumeLog = volumeLog.concat(action.logEntry);
      } else {
        volumeLog.push(action.logEntry);
      }
      logById[action.id] = volumeLog;
      return Object.assign({}, state, { logById });
    }

    case Actions.UPDATE_VOLUME_LOG: {
      const logById = Object.assign({}, state.logById);
      logById[action.id] = action.log;
      return Object.assign({}, state, { logById });
    }

    case Actions.PENDING_VOLUME_NETWORK: {
      return Object.assign({}, state, { pending: action.pending });
    }
    default:
      return state;
  }
}
