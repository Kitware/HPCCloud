import { combineReducers } from 'redux';

import clusters from './clusters';
import aws from './aws';

export default combineReducers({
  clusters,
  aws,
});
