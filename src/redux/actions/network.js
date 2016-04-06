export const ADD_NETWORK_CALL = 'ADD_NETWORK_CALL';
export const SUCCESS_NETWORK_CALL = 'SUCCESS_NETWORK_CALL';
export const ERROR_NETWORK_CALL = 'ERROR_NETWORK_CALL';
export const PROGRESS_NETWORK_CALL = 'PROGRESS_NETWORK_CALL';
export const INVLIDATE_ERROR = 'INVLIDATE_ERROR';

export function addNetworkCall(id, label = '') {
  const progress = 0;
  const ts = +new Date();

  return {
    type: ADD_NETWORK_CALL,
    id, label, progress, ts,
  };
}

export function successNetworkCall(id, resp) {
  return {
    type: SUCCESS_NETWORK_CALL,
    id, resp,
  };
}

export function errorNetworkCall(id, resp) {
  return {
    type: ERROR_NETWORK_CALL,
    id, resp,
  };
}

export function progressNetworkCall(id, progress = 0.5) {
  return {
    type: PROGRESS_NETWORK_CALL,
    id, progress,
  };
}

export function invalidateError(id) {
  return {
    type: INVLIDATE_ERROR,
    id,
  };
}
