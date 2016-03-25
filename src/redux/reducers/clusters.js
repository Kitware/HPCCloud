import * as Actions from '../actions/clusters';
import deepClone    from 'mout/src/lang/deepClone';
import set          from 'mout/src/object/set';
import style        from 'HPCCloudStyle/PageWithMenu.mcss';

const initialState = {
  list: [],
  active: 0,
  pending: false,
};

const clusterTemplate = {
  name: 'new cluster',
  type: 'trad',
  classPrefix: style.statusCreatingIcon,
  config: {
    host: 'localhost',
    ssh: {
      user: 'Your_Login',
    },
    scheduler: {
      type: 'sge',
    },
    parallelEnvironment: '',
    numberOfSlots: 1,
    jobOutputDir: '/tmp',
    paraview: {
      installDir: '/opt/paraview',
    },
    hydra: {
      executablePath: '/some/path/fake',
    },
  },
};

function applyPreset(obj, preset = null) {
  if (preset) {
    Object.keys(preset).forEach(key => {
      set(obj, key, preset[key]);
    });
  }

  return obj;
}

const STATUS_TO_ICON = {
  undefined: style.statusNeedSave,
  error: style.statusErrorIcon,
  creating: style.statusCreatingIcon,
  created: style.statusCreatedIcon,
  running: style.statusRunningIcon,
};

function updateIcon(clusters) {
  clusters.forEach(cluster => {
    // Debug
    if (!STATUS_TO_ICON[cluster.status]) {
      console.log('missing icon for:', cluster.status);
    }

    cluster.classPrefix = STATUS_TO_ICON[cluster.status];
  });
}

export default function clustersReducer(state = initialState, action) {
  switch (action.type) {
    case Actions.ADD_CLUSTER: {
      return Object.assign(
        {},
        state,
        {
          list: [].concat(state.list, deepClone(clusterTemplate)),
          active: state.list.length,
        });
    }

    case Actions.REMOVE_CLUSTER: {
      const list = state.list.splice(action.index, 1);
      const active = (state.active < list.length) ? state.active : (list.length - 1);
      return Object.assign({}, state, { list, active });
    }

    case Actions.UPDATE_ACTIVE_CLUSTER: {
      return Object.assign(
        {},
        state,
        { active: action.index });
    }

    case Actions.UPDATE_CLUSTERS: {
      const list = action.clusters;
      const active = (state.active < list.length) ? state.active : (list.length - 1);
      updateIcon(list);
      return Object.assign({}, state, { list, active });
    }

    case Actions.UPDATE_CLUSTER_PRESETS: {
      const { presets } = action;
      return Object.assign({}, state, { presets });
    }

    case Actions.SAVE_CLUSTER: {
      const { index, cluster } = action;
      updateIcon([cluster]);

      const list = [].concat(
        state.list.slice(0, index),
        cluster,
        state.list.slice(index + 1));
      const active = (state.active < list.length) ? state.active : (list.length - 1);

      return Object.assign({}, state, { list, active });
    }

    case Actions.CLUSTER_APPLY_PRESET: {
      const { index, name } = action;
      const cluster = applyPreset(Object.assign({}, state.list[index]), state.presets[name]);
      const list = [].concat(
        state.list.slice(0, index),
        cluster,
        state.list.slice(index + 1));
      const active = (state.active < list.length) ? state.active : (list.length - 1);

      return Object.assign({}, state, { list, active });
    }

    case Actions.TEST_CLUSTER: {
      return state;
    }

    case Actions.PENDING_CLUSTER_NETWORK: {
      return Object.assign({}, state, { pending: action.pending });
    }

    case Actions.TESTING_CLUSTER: {
      const { index } = action;
      const cluster = Object.assign({}, state.list[index], { classPrefix: style.statusTestingIcon });
      const list = [].concat(
        state.list.slice(0, index),
        cluster,
        state.list.slice(index + 1));

      return Object.assign({}, state, { list });
    }

    default:
      return state;
  }
}
