import girder from './GirderClient';

// Public API
export function getUserName() {
    const me = girder.getLoggedInUser();
    return '' + (me ? [ me.firstName, me.lastName].join(' ') : 'N/A');
}

export function getUser() {
	return girder.getLoggedInUser();
}

export function updateUser(user) {
	return girder.updateUser(user);
}

export function loggedIn() {
    return !!girder.getLoggedInUser();
}

export function login(username, password) {
    return girder.login(username, password);
}

export function logout() {
    return girder.logout();
}

export function onAuthChange(cb) {
    return girder.onAuthChange(cb);
}

/* eslint-disable no-shadow */
export function registerUser({firstName, lastName, login, email, password}) {
    const admin = false;
    return girder.createUser({login, email, firstName, lastName, password, admin});
}
/* eslint-enable no-shadow */

export function changePassword(oldPassword, newPassword) {
    return girder.changePassword(oldPassword, newPassword);
}
