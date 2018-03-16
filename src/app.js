/* eslint-disable import/prefer-default-export */

import 'normalize.css';
import 'HPCCloudStyle/global.mcss';

import React from 'react';
import { render } from 'react-dom';
import {
  HashRouter as Router,
  Route,
  IndexRoute,
  withRouter,
} from 'react-router-dom';
import { Provider } from 'react-redux';

import { updateVisualizerStateAccessor } from 'pvw-visualizer/src/redux/selectors/stateAccessor';

import { baseURL } from './utils/Constants';

import { store, history, dispatch } from './redux';
import * as ProjectActions from './redux/actions/projects';
import * as TaskflowActions from './redux/actions/taskflows';
import * as NetworkActions from './redux/actions/network';
import * as Behavior from './StateTransitionBehavior';
import Toaster from './panels/Toaster';

// Pages ----------------------------------------------------------------------
// import AuthMainPage from './pages/AuthContent';
import Forgot from './pages/Forgot';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Preferences from './pages/Preferences';
import PreferencesAWS from './pages/Preferences/AWS';
import PreferencesCluster from './pages/Preferences/Cluster';
import PreferencesVolumes from './pages/Preferences/Volumes';
import PreferencesUser from './pages/Preferences/User';
import PreferencesGroups from './pages/Preferences/Groups';
import PreferencesStatus from './pages/Preferences/ServerStatus';
import PreferencesNetwork from './pages/Preferences/Network';
import ProjectAll from './pages/Project/All';
import ProjectEdit from './pages/Project/Edit';
import ProjectNew from './pages/Project/New';
import ProjectView from './pages/Project/View';
import Register from './pages/Register';
import RootContainer from './pages/HPCCloud';
import SimulationEdit from './pages/Simulation/Edit';
import SimulationNew from './pages/Simulation/New';
import SimulationView from './pages/Simulation/View';

// ----------------------------------------------------------------------------
// Meta containers with routing behavior
// ----------------------------------------------------------------------------

function redirectToHome(comp) {
  // Should redirect to home if not authenticated
  console.log('redirectToHome...');
  return withRouter(comp);
}

function redirectToLogin(comp) {
  // Should redirect to login if not authenticated
  console.log('redirectToLogin...');
  return withRouter(comp);
}

function adminOnly(comp, redirectPath) {
  // Should redirect to login if not authenticated
  console.log('adminOnly...', redirectPath);
  return withRouter(comp);
}
function authSwitch(anonymous, authenticated) {
  // Should redirect to login if not authenticated
  console.log('authSwitch...', anonymous, authenticated);
  return withRouter(anonymous);
}

// ----------------------------------------------------------------------------

// Setup application and pages
const container = document.querySelector('.react-container');
updateVisualizerStateAccessor((state) => state.visualizer);

export function configure(config = { girderAPI: baseURL }) {
  render(
    <Provider store={store}>
      <main>
        <Router history={history}>
          <Route path="/" component={withRouter(RootContainer)}>
            <IndexRoute component={authSwitch(Landing, ProjectAll)} />
            <Route path="/Logout" component={withRouter(Logout)} />
            <Route path="/Register" component={redirectToHome(Register)} />
            <Route path="/Forgot" component={withRouter(Forgot)} />
            <Route path="/Login" component={redirectToHome(Login)} />
            <Route path="/New">
              <Route
                path="/New/Project"
                component={redirectToLogin(ProjectNew)}
              />
              <Route
                path="/New/Simulation/:projectId"
                component={redirectToLogin(SimulationNew)}
              />
            </Route>
            <Route path="/Edit">
              <Route
                path="/Edit/Project/:id"
                component={redirectToLogin(ProjectEdit)}
              />
              <Route
                path="/Edit/Simulation/:id"
                component={redirectToLogin(SimulationEdit)}
              />
            </Route>
            <Route path="/View">
              <Route
                path="/View/Project/:id"
                component={redirectToLogin(ProjectView)}
              />
              <Route
                path="/View/Simulation/:id"
                component={redirectToLogin(SimulationView)}
              />
              <Route
                path="/View/Simulation/:id/:step"
                component={redirectToLogin(SimulationView)}
              />
            </Route>
            <Route path="/Preferences" component={redirectToLogin(Preferences)}>
              <IndexRoute component={redirectToLogin(PreferencesUser)} />
              <Route
                path="/Preferences/User"
                component={redirectToLogin(PreferencesUser)}
              />
              <Route
                path="/Preferences/Groups"
                component={adminOnly(PreferencesGroups, '/Preferences/User')}
              />
              <Route
                path="/Preferences/AWS"
                component={redirectToLogin(PreferencesAWS)}
              />
              <Route
                path="/Preferences/Cluster"
                component={redirectToLogin(PreferencesCluster)}
              />
              <Route
                path="/Preferences/Volumes"
                component={redirectToLogin(PreferencesVolumes)}
              />
              <Route
                path="/Preferences/Status"
                component={redirectToLogin(PreferencesStatus)}
              />
              <Route
                path="/Preferences/Network"
                component={redirectToLogin(PreferencesNetwork)}
              />
            </Route>
          </Route>
        </Router>
        <Toaster />
      </main>
    </Provider>,
    container
  );
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
        Behavior.handleTaskflowChange(
          state,
          state.taskflows.mapById[taskflowId]
        );
      });
    }, 1500);
  }
});

if (history) {
  history.listen((location) => {
    const path = location.pathname.split('/');

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

    // invalidate all errors on a page change
    dispatch(NetworkActions.invalidateErrors('*'));
  });
}
