import client               from '../network';

import AuthMainPage         from '../pages/AuthContent';
import Landing              from '../pages/Landing';
import Login                from '../pages/Login';
import Logout               from '../pages/Logout';
import ProjectAll           from '../pages/Project/All';
import ProjectEdit          from '../pages/Project/Edit';
import ProjectNew           from '../pages/Project/New';
import ProjectView          from '../pages/Project/View';
import SimulationEdit       from '../pages/Simulation/Edit';
import SimulationNew        from '../pages/Simulation/New';
import SimulationView       from '../pages/Simulation/View';
import Register             from '../pages/Register';
import RootContainer        from '../pages/HPCCloud';
import Preferences          from '../pages/Preferences';
import PreferencesAWS       from '../pages/Preferences/AWS';
import PreferencesCluster   from '../pages/Preferences/Cluster';
import PreferencesOpenStack from '../pages/Preferences/OpenStack';
import PreferencesUser      from '../pages/Preferences/User';


function redirectToLogin(nextState, replace) {
    if (!client.loggedIn()) {
        replace({
            pathname: '/Login',
            state: { nextPathname: nextState.location.pathname },
        })
    }
}

function redirectToHome(nextState, replace) {
    if (client.loggedIn()) {
        console.log('Already logged in');
        replace('/');
    }
}

export default {
    component: RootContainer,
    childRoutes: [
        {
            path: '/Logout',
            component: Logout,
        },{
            path: '/Register',
            component: Register,
        },{
            // Unauthenticated routes that will redirect to home if auth
            onEnter: redirectToHome,
            childRoutes: [
                {
                    path: '/Login',
                    component: Login,
                },
            ],
        },{
            // Switch on authentication
            path: '/',
            getComponent: (location, cb) => {
                if (client.loggedIn()) {
                    return cb(null, AuthMainPage);
                }
                return cb(null, Landing);
            },
            indexRoute: {
                getComponent: (location, cb) => {
                    if (client.loggedIn()) {
                        return cb(null, ProjectAll);
                    }
                return cb();
                },
            },
        },{
            onEnter: redirectToLogin,
            path: '/New',
            childRoutes: [
                {
                    path: 'Project',
                    component: ProjectNew,
                },{
                    path: 'Simulation/:projectId',
                    component: SimulationNew,
                },
            ],
        },{
            onEnter: redirectToLogin,
            path: '/Edit',
            childRoutes: [
                {
                    path: 'Project/:id',
                    component: ProjectEdit,
                },{
                    path: 'Simulation/:id',
                    component: SimulationEdit,
                },
            ],
        },{
            onEnter: redirectToLogin,
            path: '/View',
            childRoutes: [
                {
                    path: 'Project/:id',
                    component: ProjectView,
                },{
                    path: 'Simulation/:id',
                    component: SimulationView,
                },{
                    path: 'Simulation/:id/:step',
                    component: SimulationView,
                },
            ],
        },{
            onEnter: redirectToLogin,
            path: '/Preferences',
            component: Preferences,
            childRoutes: [
                {
                    path: 'User',
                    component: PreferencesUser,
                },{
                    path: 'AWS',
                    component: PreferencesAWS,
                },{
                    path: 'Cluster',
                    component: PreferencesCluster,
                },{
                    path: 'OpenStack',
                    component: PreferencesOpenStack,
                },
            ],
        },
    ],
}
