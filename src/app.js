/* eslint-disable import/prefer-default-export */

import 'normalize.css';
import 'HPCCloudStyle/global.mcss';

import React from 'react';
import { render } from 'react-dom';
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import { Provider } from 'react-redux';

import { updateVisualizerStateAccessor } from 'pvw-visualizer/src/redux/selectors/stateAccessor';

import { baseURL } from './utils/Constants';

import { store, dispatch } from './redux';
import * as TaskflowActions from './redux/actions/taskflows';
import * as Behavior from './StateTransitionBehavior';
import Toaster from './panels/Toaster';
import Condition from './panels/Switch';
import AuthRoute from './panels/AuthRoute';

import client from './network';

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

function loggedIn() {
  return !!client.getLoggedInUser();
}

// ----------------------------------------------------------------------------

// Setup application and pages
const container = document.querySelector('.react-container');
updateVisualizerStateAccessor((state) => state.visualizer);

export function configure(config = { girderAPI: baseURL }) {
  render(
    <Provider store={store}>
      <main>
        <Router>
          <RootContainer>
            <Switch>
              <Route
                exact
                path="/"
                render={(props) => (
                  <Condition
                    if={loggedIn}
                    then={ProjectAll}
                    else={Landing}
                    {...props}
                  />
                )}
              />
              <Route path="/Logout" component={Logout} />
              <Route
                path="/Register"
                render={(props) => (
                  <Condition
                    if={loggedIn}
                    then={Redirect}
                    thenProps={{ to: '/' }}
                    else={Register}
                    {...props}
                  />
                )}
              />
              <Route path="/Forgot" component={Forgot} />
              <Route
                path="/Login"
                render={(props) => (
                  <Condition
                    if={loggedIn}
                    then={Redirect}
                    thenProps={{ to: '/' }}
                    else={Login}
                    {...props}
                  />
                )}
              />
              <Route path="/New">
                <Switch>
                  <AuthRoute path="/New/Project" component={ProjectNew} />
                  <AuthRoute
                    path="/New/Simulation/:projectId"
                    component={SimulationNew}
                  />
                </Switch>
              </Route>
              <Route path="/Edit">
                <Switch>
                  <AuthRoute path="/Edit/Project/:id" component={ProjectEdit} />
                  <AuthRoute
                    path="/Edit/Simulation/:id"
                    component={SimulationEdit}
                  />
                </Switch>
              </Route>
              <Route path="/View">
                <Switch>
                  <AuthRoute path="/View/Project/:id" component={ProjectView} />
                  <AuthRoute
                    path="/View/Simulation/:id"
                    component={SimulationView}
                  />
                  <AuthRoute
                    path="/View/Simulation/:id/:step"
                    component={SimulationView}
                  />
                </Switch>
              </Route>
              <Route path="/Preferences">
                <Preferences>
                  <Switch>
                    <AuthRoute
                      exact
                      path="/Preferences"
                      component={PreferencesUser}
                    />
                    <AuthRoute
                      path="/Preferences/User"
                      component={PreferencesUser}
                    />
                    <AuthRoute
                      path="/Preferences/Groups"
                      component={PreferencesGroups}
                      admin
                      redirectTo="/Preferences/User"
                    />
                    <AuthRoute
                      path="/Preferences/AWS"
                      component={PreferencesAWS}
                    />
                    <AuthRoute
                      path="/Preferences/Cluster"
                      component={PreferencesCluster}
                    />
                    <AuthRoute
                      path="/Preferences/Volumes"
                      component={PreferencesVolumes}
                    />
                    <AuthRoute
                      path="/Preferences/Status"
                      component={PreferencesStatus}
                    />
                    <AuthRoute
                      path="/Preferences/Network"
                      component={PreferencesNetwork}
                    />
                  </Switch>
                </Preferences>
              </Route>
            </Switch>
          </RootContainer>
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
