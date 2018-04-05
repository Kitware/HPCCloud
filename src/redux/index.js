import { createStore } from 'redux';

import reducers from './reducers';

const store = createStore(reducers);

function dispatch(action) {
  let currentAction = action;
  while (typeof currentAction === 'function') {
    currentAction = action(dispatch);
  }
  return store.dispatch(currentAction);
}

export default store;

export { store, dispatch };
