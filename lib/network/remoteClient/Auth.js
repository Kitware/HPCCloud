import Observable from 'tonic-ui/lib/util/Observable';
import girder     from 'js-girder-client/src/girder';

var userInfo;

const NoOp = () => {};
const AUTH_CHANGE_TOPIC = 'auth.change';
const listenerHandler = new Observable();
const { protocol, hostname, port } = window.location;
const configuration = { protocol, port, host: hostname, basepath: "/api/v1" };

function triggerAuthChange(isLoggedIn) {
    listenerHandler.emit(AUTH_CHANGE_TOPIC, isLoggedIn);
}

function updateGirderToken() {
    try {
        configuration.token = document.cookie.split('girderToken=')[1].split(';')[0].trim();
    } catch (e) {
        delete configuration.token;
    }
}

// Configure girder client
updateGirderToken();
girder(configuration);

if(configuration.token) {
    girder.me( (err, ok) => {
        if(err) {
            console.log('Me Error', err);
        } else {
            userInfo = ok.content;
            triggerAuthChange(true);
        }
    })
}

// Public API
export function getUserName() {
    return '' + (userInfo ? [ userInfo.firstName, userInfo.lastName].join(' ') : 'N/A');
}

export function loggedIn() {
    return !!userInfo;
}

export function login(username, password, cb=NoOp) {
    girder.login(username, password, (err, ok) => {
        if(err) {
            triggerAuthChange(false);
            cb('Error: ' + err);
        } else {
            userInfo = ok.content.user;
            cb();
            triggerAuthChange(true);
        }
    });
}

export function logout(cb=NoOp) {
    userInfo = null;
    girder.logout( (err, resp) => {
        if(err) {
            console.log('Logout Error: ', err);
        }
        cb();
        triggerAuthChange(false);
    });
}

export function onAuthChange(cb) {
    return listenerHandler.on(AUTH_CHANGE_TOPIC, cb);
}

/* eslint-disable no-shadow */
export function registerUser({firstName, lastName, login, email, password}, cb=NoOp) {
    const admin = false;
    girder.createUser({login, email, firstName, lastName, password, admin}, (err, ok) => {
        if(err) {
            cb(err.message);
        } else {
            cb();
        }
    })
}
/* eslint-enable no-shadow */

