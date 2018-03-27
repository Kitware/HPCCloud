import { createStore } from 'redux';
import { createHashHistory } from 'history';

import reducers from './reducers';

const store = createStore(reducers);
const history = createHashHistory();

function dispatch(action) {
  let currentAction = action;
  while (typeof currentAction === 'function') {
    currentAction = action(dispatch);
  }
  return store.dispatch(currentAction);
}

export default store;

export { store, dispatch, history };
