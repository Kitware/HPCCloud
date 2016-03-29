import { combineReducers } from 'redux';

import clusters from './clusters';
import aws from './aws';
import statuses from './statuses';

export default combineReducers({
  clusters,
  aws,
  statuses,
});
