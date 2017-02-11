import client               from '../network';
import * as router          from '../redux/actions/router';
import { dispatch }         from '../redux';

import AuthMainPage         from '../pages/AuthContent';
import Forgot               from '../pages/Forgot';
import Landing              from '../pages/Landing';
import Login                from '../pages/Login';
import Logout               from '../pages/Logout';
import Preferences          from '../pages/Preferences';
import PreferencesAWS       from '../pages/Preferences/AWS';
import PreferencesCluster   from '../pages/Preferences/Cluster';
import PreferencesOpenStack from '../pages/Preferences/OpenStack';
import PreferencesUser      from '../pages/Preferences/User';
import PreferencesGroups    from '../pages/Preferences/Groups';
import PreferencesStatus    from '../pages/Preferences/ServerStatus';
import PreferencesNetwork   from '../pages/Preferences/Network';
import ProjectAll           from '../pages/Project/All';
import ProjectEdit          from '../pages/Project/Edit';
import ProjectNew           from '../pages/Project/New';
import ProjectView          from '../pages/Project/View';
import Register             from '../pages/Register';
import RootContainer        from '../pages/HPCCloud';
import SimulationEdit       from '../pages/Simulation/Edit';
import SimulationNew        from '../pages/Simulation/New';
import SimulationView       from '../pages/Simulation/View';

function loggedIn() {
  return !!client.getLoggedInUser();
}

function redirectToLogin(nextState, replace) {
  if (loggedIn()) {
    return;
  }
  client.isLoggedIn()
    .catch((err) => {
      // we need to dispatch here,
      // but in redirectToHome below those replace()'s work fine.
      dispatch(router.replace({
        pathname: '/',
        state: { nextPathname: nextState.location.pathname },
      }));
    });
}

function redirectToHome(nextState, replace) {
  if (loggedIn()) {
    replace('/');
    return;
  }
  client.isLoggedIn()
    .then(() => {
      replace('/');
    })
    .catch(() => {
      replace('/');
    });
}

export default {
  component: RootContainer,
  childRoutes: [
    {
      path: '/Logout',
      component: Logout,
    }, {
      onEnter: redirectToHome,
      path: '/Register',
      component: Register,
    }, {
      path: '/Forgot',
      component: Forgot,
    }, {
      // Unauthenticated routes that will redirect to home if auth
      onEnter: redirectToHome,
      childRoutes: [
        {
          path: '/Login',
          component: Login,
        },
      ],
    }, {
      // Switch on authentication
      path: '/',
      getComponent: (location, cb) => {
        if (loggedIn()) {
          cb(null, AuthMainPage);
          return;
        }
        client.isLoggedIn()
          .then(
            () => {
              cb(null, AuthMainPage);
            },
            () => {
              cb(null, Landing);
            });
      },
      indexRoute: {
        getComponent: (location, cb) => {
          if (loggedIn()) {
            cb(null, ProjectAll);
            return;
          }
          client.isLoggedIn()
            .then(
              () => {
                cb(null, ProjectAll);
              },
              () => {
                cb();
              });
        },
      },
    }, {
      onEnter: redirectToLogin,
      path: '/New',
      childRoutes: [
        {
          path: 'Project',
          component: ProjectNew,
        }, {
          path: 'Simulation/:projectId',
          component: SimulationNew,
        },
      ],
    }, {
      onEnter: redirectToLogin,
      path: '/Edit',
      childRoutes: [
        {
          path: 'Project/:id',
          component: ProjectEdit,
        }, {
          path: 'Simulation/:id',
          component: SimulationEdit,
        },
      ],
    }, {
      onEnter: redirectToLogin,
      path: '/View',
      childRoutes: [
        {
          path: 'Project/:id',
          component: ProjectView,
        }, {
          path: 'Simulation/:id',
          component: SimulationView,
        }, {
          path: 'Simulation/:id/:step',
          component: SimulationView,
        },
      ],
    }, {
      onEnter: redirectToLogin,
      path: '/Preferences',
      component: Preferences,
      indexRoute: {
        component: PreferencesUser,
      },
      childRoutes: [
        {
          path: 'User',
          component: PreferencesUser,
        }, {
          onEnter: (nextState, replace) => {
            client.isLoggedIn()
              .then(() => {
                const user = client.getLoggedInUser();
                if (user === undefined || !user.admin) {
                  dispatch(router.replace({ pathname: '/Preferences/User' }));
                }
              });
          },
          path: 'Groups',
          component: PreferencesGroups,
        }, {
          path: 'AWS',
          component: PreferencesAWS,
        }, {
          path: 'Cluster',
          component: PreferencesCluster,
        }, {
          path: 'Status',
          component: PreferencesStatus,
        }, {
          path: 'Network',
          component: PreferencesNetwork,
        }, {
          path: 'OpenStack',
          component: PreferencesOpenStack,
        },
      ],
    },
  ],
};
