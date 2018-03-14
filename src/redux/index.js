import reducers from './reducers';
import { createStore, applyMiddleware } from 'redux';
import { hashHistory } from 'react-router';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';

const routingMiddleware = routerMiddleware(hashHistory);

const store = createStore(reducers, applyMiddleware(routingMiddleware));
const history = syncHistoryWithStore(hashHistory, store);

function dispatch(action) {
  var currentAction = action;
  while (typeof currentAction === 'function') {
    currentAction = action(dispatch);
  }
  return store.dispatch(currentAction);
}

export default store;

export { store, dispatch, history };
