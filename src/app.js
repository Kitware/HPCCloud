import 'normalize.css';
import 'HPCCloudStyle/global.mcss';

import React              from 'react';
import { render }         from 'react-dom';
import { Router }         from 'react-router';
import { Provider }       from 'react-redux';

import routes             from './config/routes';
import { store, history } from './redux';

// Setup application and pages
const container = document.querySelector('.react-container');

export function configure(config = { girderAPI: '/api/v1' }) {
  render(
    <Provider store={ store }>
      <Router history={ history } routes={ routes } />
    </Provider>, container);
}
