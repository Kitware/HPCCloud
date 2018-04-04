import axios, { CancelToken } from 'axios';
import Monologue from 'monologue.js';

// ----------------------------------------------------------------------------
const AUTH_CHANGE_TOPIC = 'girder.auth.change';
const BUSY_TOPIC = 'girder.busy';
const PROGRESS_TOPIC = 'girder.progress';
const EVENT_TOPIC = 'girder.notification';

class Observable {}
Monologue.mixInto(Observable);

const _LOGIN_PROMISE = () => Promise.resolve('login');
const _LOGOUT_PROMISE = () => Promise.reject('logout');

// ----------------------------------------------------------------------------

function encodeQueryAsString(query = {}) {
  const params = Object.keys(query).map((name) =>
    [encodeURIComponent(name), encodeURIComponent(query[name])].join('=')
  );
  return params.length ? `?${params.join('&')}` : '';
}

// ----------------------------------------------------------------------------

function filterQuery(query = {}, ...keys) {
  const out = {};
  keys.forEach((key) => {
    if (query[key] !== undefined && query[key] !== null) {
      out[key] = query[key];
    }
  });
  return out;
}

// ----------------------------------------------------------------------------

function mustContain(object = {}, ...keys) {
  let missingKeys = [];
  let promise;
  keys.forEach((key) => {
    if (object[key] === undefined) {
      missingKeys.push(key);
    }
  });
  if (missingKeys.length === 0) {
    missingKeys = undefined;
    promise = Promise.resolve(true);
  } else {
    promise = Promise.reject(`Missing keys ${missingKeys.join(', ')}`);
  }

  return {
    missingKeys,
    promise,
  };
}

// ----------------------------------------------------------------------------

export function build(config = window.location, ...extensions) {
  let userData;
  let token;
  let loginPromise;
  let isAuthenticated = false;
  let eventSource = null;
  let busyCounter = 0;

  const client = {}; // Must be const otherwise the created closure will fail
  const notification = new Observable();
  const idle = () => {
    busyCounter -= 1;
    notification.emit(BUSY_TOPIC, busyCounter);
  };
  const busy = (promise) => {
    busyCounter += 1;
    notification.emit(BUSY_TOPIC, busyCounter);
    promise.then(idle);
    return promise;
  };
  const { protocol, hostname, port, basepath = '/api/v1' } = config;
  const baseURL = `${protocol}//${hostname}:${port}${basepath}`;
  const connectToNotificationStream = () => {
    if (EventSource) {
      eventSource = new EventSource(`${baseURL}/notification/stream`);
      eventSource.onmessage = (e) => {
        const parsed = JSON.parse(e.data);
        notification.emit(EVENT_TOPIC, parsed);
      };

      eventSource.onerror = (e) => {
        // Wait 2 seconds if the browser hasn't reconnected then reinitialize.
        setTimeout(() => {
          if (eventSource && eventSource.readyState === EventSource.CLOSED) {
            connectToNotificationStream();
          } else {
            eventSource.close();
            eventSource = null;
            connectToNotificationStream();
          }
        }, 2000);
      };
    }
  };

  function extractLocalToken() {
    try {
      return document.cookie
        .split('girderToken=')[1]
        .split(';')[0]
        .trim();
    } catch (e) {
      return undefined;
    }
  }
  function updateGirderInstance() {
    const timeout = 60000;
    const headers = {};

    if (token) {
      headers['Girder-Token'] = token;
    }

    client._ = {};

    const methods = axios.create({
      baseURL,
      timeout,
      headers,
    });

    // wrap xhr requests so we can give a cancel to each,
    // we need to make a new cancel token for each request.
    ['get', 'delete', 'head'].forEach((req) => {
      client._[req] = (url, conf) => {
        const cSource = CancelToken.source();
        client.cancel = cSource.cancel;
        return methods[req](
          url,
          Object.assign({}, conf, {
            cancelToken: cSource.token,
          })
        );
      };
    });

    ['post', 'put', 'patch'].forEach((req) => {
      client._[req] = (url, data, conf) => {
        const cSource = CancelToken.source();
        client.cancel = cSource.cancel;
        return methods[req](
          url,
          data,
          Object.assign({}, conf, {
            cancelToken: cSource.token,
          })
        );
      };
    });
  }
  function updateAuthenticationState(state) {
    if (isAuthenticated !== !!state) {
      // Clear cache data if not logged-in
      if (!state) {
        userData = undefined;
        token = undefined;
        // Update userData for external modules
        client.user = userData;
        client.token = undefined;
      }

      // Update internal state
      isAuthenticated = !!state;
      updateGirderInstance();

      // Broadcast information
      /* eslint-disable babel/new-cap */
      loginPromise = state ? _LOGIN_PROMISE() : _LOGOUT_PROMISE();
      /* eslint-enable babel/new-cap */
      notification.emit(AUTH_CHANGE_TOPIC, isAuthenticated);
      if (isAuthenticated && eventSource === null) {
        connectToNotificationStream();
      }
    }
  }
  function progress(id, current, total = 1) {
    notification.emit(PROGRESS_TOPIC, {
      id,
      current,
      total,
    });
  }

  // Fill up public object
  const publicObject = {
    login(username, password) {
      const auth = {
        username,
        password,
      };
      return new Promise((accept, reject) => {
        busy(
          client._.get('/user/authentication', { auth })
            .then((resp) => {
              token = resp.data.authToken.token;
              userData = resp.data.user;

              // Update userData for external modules
              client.user = userData;
              client.token = token;

              updateAuthenticationState(true);
              accept();
            })
            .catch((err) => {
              updateAuthenticationState(false);
              reject(err);
            })
        );
      });
    },

    logout() {
      return busy(
        client._.delete('/user/authentication').then(
          (ok) => {
            updateAuthenticationState(false);
            if (document && document.cookie) {
              document.cookie =
                'Girder-Token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }
          },
          (ko) => {
            console.log('loggout error', ko);
          }
        )
      );
    },

    me() {
      return busy(client._.get('/user/me'));
    },

    isLoggedIn() {
      return loginPromise;
    },

    getLoggedInUser() {
      return userData;
    },

    onAuthChange(callback) {
      return notification.on(AUTH_CHANGE_TOPIC, callback);
    },

    onBusy(callback) {
      return notification.on(BUSY_TOPIC, callback);
    },

    onProgress(callback) {
      return notification.on(PROGRESS_TOPIC, callback);
    },

    onEvent(callback) {
      return notification.on(EVENT_TOPIC, callback);
    },

    destroy() {
      notification.off();
    },

    cancel() {
      if (client.cancel) {
        client.cancel('request was canceled');
      }
    },
  };

  // Try to extract token from
  loginPromise = new Promise((accept, reject) => {
    token = config.token || extractLocalToken();
    updateGirderInstance();
    if (token) {
      publicObject
        .me()
        .then((resp) => {
          if (!resp.data) {
            updateAuthenticationState(false);
            userData = null;
            reject(resp);
            return;
          }
          // Update userData for external modules
          userData = resp.data;
          client.user = userData;
          client.token = token;
          updateAuthenticationState(true);
          accept();
        })
        .catch((errResp) => {
          updateAuthenticationState(false);
          reject(errResp);
        });
    } else {
      reject('No token');
    }
  });

  // Expend client
  client.baseURL = baseURL;
  client.cancel = null;

  // Add extensions
  const spec = {
    busy,
    client,
    encodeQueryAsString,
    filterQuery,
    mustContain,
    notification,
    progress,
  };

  function processExtension(ext) {
    if (Array.isArray(ext)) {
      ext.forEach(processExtension);
    } else {
      const obj = ext(spec);
      Object.keys(obj).forEach((key) => {
        publicObject[key] = obj[key];
      });
    }
  }

  processExtension(extensions);

  // Return the newly composed object
  // if karma, return an unfrozen version so we can spy on it
  /* global KARMA_TEST_RUNNER */
  if (KARMA_TEST_RUNNER) {
    return publicObject;
  }
  return Object.freeze(publicObject);
}

export default {
  build,
};
