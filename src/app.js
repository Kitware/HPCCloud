import 'normalize.css';
import 'HPCCloudStyle/global.mcss';

import React              from 'react';
import { render }         from 'react-dom';
import { Router }         from 'react-router';
import { Provider }       from 'react-redux';

import routes                       from './config/routes';
import { store, history, dispatch } from './redux';
import * as ProjectActions          from './redux/actions/projects';

// Setup application and pages
const container = document.querySelector('.react-container');

export function configure(config = { girderAPI: '/api/v1' }) {
  render(
    <Provider store={ store }>
      <Router history={ history } routes={ routes } />
    </Provider>, container);
}


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
