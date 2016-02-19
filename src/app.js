import 'normalize.css';
import 'HPCCloudStyle/global.mcss';

import React                   from 'react';
import { render }              from 'react-dom';
import { Router, hashHistory } from 'react-router';
import routes                  from './config/routes';

// Setup application and pages
const container = document.querySelector('.react-container');

export function configure(config={ girderAPI: '/api/v1' }) {
    render(<Router history={hashHistory} routes={routes}/>, container);
}
