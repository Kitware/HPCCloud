import { combineReducers } from 'redux';
import { routerReducer }  from 'react-router-redux';

import auth         from './auth';
import fs           from './fs';
import network      from './network';
import preferences  from './preferences';
import projects     from './projects';
import simulations  from './simulations';
import taskflows    from './taskflows';

export default combineReducers({
  auth,
  fs,
  network,
  preferences,
  projects,
  simulations,
  taskflows,

  routing: routerReducer,
});
