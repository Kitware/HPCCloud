import React                   from 'react';
import { render }              from 'react-dom';
import { Router, hashHistory } from 'react-router';
import routes                  from './config/routes';
// import pages                  from './pages';

// Load CSS
require('font-awesome/css/font-awesome.css');
require('normalize.css');
require('./style/elements.css');

// Setup application and pages
const container = document.querySelector('.react-container');

export function configure(config={ girderAPI: '/api/v1' }) {
    console.log('Start HPCCloud', config);
    render(<Router history={hashHistory} routes={routes}/>, container);
}
