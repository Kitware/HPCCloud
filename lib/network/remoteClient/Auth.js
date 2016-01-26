import girder     from './GirderClient';

const NoOp = () => {};

// Public API
export function getUserName() {
    const me = girder.getLoggedInUser();
    return '' + (me ? [ me.firstName, me.lastName].join(' ') : 'N/A');
}

export function loggedIn() {
    return !!girder.getLoggedInUser();
}

export function login(username, password, cb=NoOp) {
    girder.login(username, password).then(
        ok => cb(),
        ko => cb('Error: ' + ko)
    );
}

export function logout(cb=NoOp) {
    girder.logout().then(cb, cb);
}

export function onAuthChange(cb) {
    return girder.onAuthChange(cb);
}

/* eslint-disable no-shadow */
export function registerUser({firstName, lastName, login, email, password}, cb=NoOp) {
    const admin = false;
    girder.createUser({login, email, firstName, lastName, password, admin})
        .then(
            ok => cb(null, ok.data),
            ko => cb('Error: ' + ko.data, ko)
        );
}
/* eslint-enable no-shadow */

