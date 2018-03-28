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
  console.log('is loggedIn', !!client.getLoggedInUser());
  return !!client.getLoggedInUser();
}

function isAdmin() {
  if (loggedIn()) {
    const user = client.getLoggedInUser();
    return user.admin;
  }
  return false;
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
                render={() => {
                  console.log('render home route');
                  return loggedIn() ? <ProjectAll /> : <Landing />;
                }}
              />
              <Route path="/Logout" component={Logout} />
              <Route
                path="/Register"
                render={() => (loggedIn() ? <Redirect to="/" /> : <Register />)}
              />
              <Route path="/Forgot" component={Forgot} />
              <Route
                path="/Login"
                render={() => (loggedIn() ? <Redirect to="/" /> : <Login />)}
              />
              <Route path="/New">
                <Switch>
                  <Route
                    path="/New/Project"
                    render={() =>
                      loggedIn() ? <ProjectNew /> : <Redirect to="/" />
                    }
                  />
                  <Route
                    path="/New/Simulation/:projectId"
                    render={() =>
                      loggedIn() ? <SimulationNew /> : <Redirect to="/" />
                    }
                  />
                </Switch>
              </Route>
              <Route path="/Edit">
                <Switch>
                  <Route
                    path="/Edit/Project/:id"
                    render={() =>
                      loggedIn() ? <ProjectEdit /> : <Redirect to="/" />
                    }
                  />
                  <Route
                    path="/Edit/Simulation/:id"
                    render={() =>
                      loggedIn() ? <SimulationEdit /> : <Redirect to="/" />
                    }
                  />
                </Switch>
              </Route>
              <Route path="/View">
                <Switch>
                  <Route
                    path="/View/Project/:id"
                    render={() =>
                      loggedIn() ? <ProjectView /> : <Redirect to="/" />
                    }
                  />
                  <Route
                    path="/View/Simulation/:id"
                    render={() =>
                      loggedIn() ? <SimulationView /> : <Redirect to="/" />
                    }
                  />
                  <Route
                    path="/View/Simulation/:id/:step"
                    render={() =>
                      loggedIn() ? <SimulationView /> : <Redirect to="/" />
                    }
                  />
                </Switch>
              </Route>
              <Route path="/Preferences">
                <Preferences>
                  <Switch>
                    <Route
                      exact
                      path="/Preferences"
                      render={() =>
                        loggedIn() ? <PreferencesUser /> : <Redirect to="/" />
                      }
                    />
                    <Route
                      path="/Preferences/User"
                      render={() =>
                        loggedIn() ? <PreferencesUser /> : <Redirect to="/" />
                      }
                    />
                    <Route
                      path="/Preferences/Groups"
                      render={() =>
                        isAdmin() ? (
                          <PreferencesGroups />
                        ) : (
                          <Redirect to="/Preferences/User" />
                        )
                      }
                    />
                    <Route
                      path="/Preferences/AWS"
                      render={() =>
                        loggedIn() ? <PreferencesAWS /> : <Redirect to="/" />
                      }
                    />
                    <Route
                      path="/Preferences/Cluster"
                      render={() =>
                        loggedIn() ? (
                          <PreferencesCluster />
                        ) : (
                          <Redirect to="/" />
                        )
                      }
                    />
                    <Route
                      path="/Preferences/Volumes"
                      render={() =>
                        loggedIn() ? (
                          <PreferencesVolumes />
                        ) : (
                          <Redirect to="/" />
                        )
                      }
                    />
                    <Route
                      path="/Preferences/Status"
                      render={() =>
                        loggedIn() ? <PreferencesStatus /> : <Redirect to="/" />
                      }
                    />
                    <Route
                      path="/Preferences/Network"
                      render={() =>
                        loggedIn() ? (
                          <PreferencesNetwork />
                        ) : (
                          <Redirect to="/" />
                        )
                      }
                    />
                  </Switch>
                </Preferences>
              </Route>
              <Route
                render={({ location }) => (
                  <div>No route for {location.pathname}</div>
                )}
              />
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
