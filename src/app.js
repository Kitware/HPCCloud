import 'normalize.css';
import 'HPCCloudStyle/global.mcss';
import { baseURL }  from './utils/Constants.js';

import React        from 'react';
import { render }   from 'react-dom';
import { Router }   from 'react-router';
import { Provider } from 'react-redux';

import routes                       from './config/routes';
import { store, history, dispatch } from './redux';
import * as ProjectActions          from './redux/actions/projects';
import * as TaskflowActions         from './redux/actions/taskflows';
import * as Behavior                from './StateTransitionBehavior';

import { updateVisualizerRootState } from 'pvw-visualizer/src/redux';

// Setup application and pages
const container = document.querySelector('.react-container');
updateVisualizerRootState(state => state.visualizer);

export function configure(config = { girderAPI: baseURL }) {
  render(
    <Provider store={ store }>
      <Router history={ history } routes={ routes } />
    </Provider>, container);
}

let logDebounce = null;

store.subscribe(() => {
  const state = store.getState();
  if (state.taskflows.updateLogs.length > 0) {
    if (logDebounce) {
      clearTimeout(logDebounce);
    }
    logDebounce = setTimeout(() => {
      const updateLogs = state.taskflows.updateLogs;
      dispatch(TaskflowActions.clearUpdateLog());
      updateLogs.forEach((taskflowId) => {
        // Handle any behavior from taskflow change
        Behavior.handleTaskflowChange(state, state.taskflows.mapById[taskflowId]);
      });
    }, 1500);
  }
});

if (history) {
  history.listen(location => {
    var path = location.pathname.split('/');

    // Remove any nested path => [ 'View|Edit', 'Project|Simulation', '${ID}']
    while (path.length > 4) {
      path.pop();
    }

    // Extract id / type
    const id = path.pop();
    const type = path.pop();

    // Activate the proper type
    if (type === 'Simulation') {
      dispatch(ProjectActions.setActiveSimulation(id));
    }
    if (type === 'Project') {
      dispatch(ProjectActions.setActiveProject(id));
    }
  });
}
