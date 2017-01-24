import { combineReducers } from 'redux';
import { routerReducer }  from 'react-router-redux';

import auth         from './auth';
import fs           from './fs';
import network      from './network';
import preferences  from './preferences';
import progress     from './progress';
import projects     from './projects';
import simulations  from './simulations';
import taskflows    from './taskflows';
import volumes      from './volumes';

import visualizer   from 'pvw-visualizer/src/redux/reducers';

export default combineReducers({
  auth,
  fs,
  network,
  preferences,
  progress,
  projects,
  simulations,
  taskflows,
  volumes,

  routing: routerReducer,
  visualizer,
});
