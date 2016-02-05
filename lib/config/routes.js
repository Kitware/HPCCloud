import client               from '../network';

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
import ProjectAll           from '../pages/Project/All';
import ProjectEdit          from '../pages/Project/Edit';
import ProjectNew           from '../pages/Project/New';
import ProjectView          from '../pages/Project/View';
import Register             from '../pages/Register';
import RootContainer        from '../pages/HPCCloud';
import SimulationEdit       from '../pages/Simulation/Edit';
import SimulationNew        from '../pages/Simulation/New';
import SimulationView       from '../pages/Simulation/View';


function redirectToLogin(nextState, replace) {
    if(client.loggedIn()) {
        return;
    }
    client.getLoggedInPromise()
        .catch(()=>{
            replace({
                pathname: '/Login',
                state: { nextPathname: nextState.location.pathname },
            });
        });
}

function redirectToHome(nextState, replace) {
    if(client.loggedIn()) {
        return replace('/');
    }
    client.getLoggedInPromise().then(()=>{replace('/');});
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
            path: '/Forgot',
            component: Forgot,
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
                if(client.loggedIn()) {
                    cb(null, AuthMainPage);
                    return;
                }
                client.getLoggedInPromise()
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
                    if(client.loggedIn()) {
                        cb(null, ProjectAll);
                        return;
                    }
                    client.getLoggedInPromise()
                        .then(
                            () => {
                                cb(null, ProjectAll);
                            },
                            () => {
                                cb();
                            });
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
            indexRoute: {
                component: PreferencesUser,
            },
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
