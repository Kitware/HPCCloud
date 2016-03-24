import { combineReducers } from 'redux';

import auth     from './auth';
import network  from './network';
import { routerReducer }  from 'react-router-redux';

export default combineReducers({
  auth,
  network,
  routing: routerReducer,
});
