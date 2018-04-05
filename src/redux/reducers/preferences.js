import { combineReducers } from 'redux';

import clusters from './clusters';
import aws from './aws';
import statuses from './statuses';
import volumes from './volumes';

export default combineReducers({
  clusters,
  aws,
  statuses,
  volumes,
});
