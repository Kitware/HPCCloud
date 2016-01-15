import cachedData from './InitialCache';
import Observable from 'tonic-ui/lib/util/Observable';

const AUTH_CHANGE_TOPIC = 'auth.change';
const listenerHandler = new Observable();

function pretendRequest(userName, pass, cb) {
    const userData = cachedData.users[userName];
    setTimeout(() => {
        if (userData && userData.password === pass) {
            userData.token = Math.random().toString(36).substring(7);
            cb({
                authenticated: true,
                token: userData.token,
            });
        } else {
            cb({ authenticated: false })
        }
    }, 0)
}

function triggerAuthChange(isLoggedIn) {
    listenerHandler.emit(AUTH_CHANGE_TOPIC, isLoggedIn);
}

/* eslint-disable no-shadow */
export function registerUser({firstName, lastName, login, email, password}, cb) {
    const previousUser = cachedData.users[login];
    if(previousUser) {
        cb('User ' + login + ' already exist');
    } else {
        cachedData.users[login] = { firstName, lastName, login, email, password };
        cb();
    }
}
/* eslint-enable no-shadow */

export function onAuthChange(cb) {
    return listenerHandler.on(AUTH_CHANGE_TOPIC, cb);
}

export function login(userName, pass, cb) {
    cb = arguments[arguments.length - 1];
    if (localStorage.token && cachedData.users[userName] && cachedData.users[userName].token === localStorage.token) {
      if (cb) {
        cb(true);
      }
      triggerAuthChange(true);
      return;
    }

    pretendRequest(userName, pass, (res) => {
      if (res.authenticated) {
        cachedData.authUsers[res.token] = true;
        localStorage.token = res.token;
        localStorage.login = userName;
        if (cb) {
          cb(true);
        }
        triggerAuthChange(true);
      } else {
        if (cb) {
          cb(false);
        }
        triggerAuthChange(false);
      }
    })
}

export function logout(cb) {
    delete cachedData.authUsers[localStorage.token];
    delete localStorage.token;
    delete localStorage.login;
    if (cb) {
      cb();
    }
    triggerAuthChange(false);
}

export function loggedIn() {
    // Hack to allow existing users to stay logged in
    if(cachedData.users[localStorage.login] && cachedData.users[localStorage.login].token === null) {
        cachedData.users[localStorage.login].token = localStorage.token;
        cachedData.authUsers[localStorage.token] = true;
    }

    return !!cachedData.authUsers[localStorage.token];
}

export function getUserName() {
    if(localStorage.token) {
        for(const l in cachedData.users) {
            if(cachedData.users[l].token === localStorage.token) {
                return [cachedData.users[l].firstName, cachedData.users[l].lastName].join(' ');
            }
        }
    }
    return 'Unkown';
}
