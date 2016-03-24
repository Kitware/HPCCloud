import reducers                                   from './reducers';
import thunk                                      from 'redux-thunk';
import { createStore, applyMiddleware }           from 'redux';
import { hashHistory }                            from 'react-router';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';

const routingMiddleware = routerMiddleware(hashHistory);

export const store = createStore(reducers, applyMiddleware(thunk, routingMiddleware));
export const history = syncHistoryWithStore(hashHistory, store);

export default store;
