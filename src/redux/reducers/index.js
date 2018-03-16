import { combineReducers } from 'redux';

import visualizer from 'pvw-visualizer/src/redux/reducers';

import auth from './auth';
import fs from './fs';
import groups from './groups';
import network from './network';
import preferences from './preferences';
import progress from './progress';
import projects from './projects';
import simulations from './simulations';
import taskflows from './taskflows';

export default combineReducers({
  auth,
  fs,
  groups,
  network,
  preferences,
  progress,
  projects,
  simulations,
  taskflows,
  visualizer,
});
