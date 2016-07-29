import client           from '../../network';
import { dispatch }     from '../index.js';

export const ADD_NETWORK_CALL = 'ADD_NETWORK_CALL';
export const SUCCESS_NETWORK_CALL = 'SUCCESS_NETWORK_CALL';
export const ERROR_NETWORK_CALL = 'ERROR_NETWORK_CALL';
export const INVALIDATE_ERROR = 'INVALIDATE_ERROR';
export const PREPARE_UPLOAD = 'PREPARE_UPLOAD';
export const RESET_PROGRESS = 'RESET_PROGRESS';
export const ON_PROGRESS = 'ON_PROGRESS';

/* eslint-disable no-shadow */

export function addNetworkCall(id, label = '') {
  const ts = +new Date();

  return {
    type: ADD_NETWORK_CALL,
    id, label, ts,
  };
}

export function successNetworkCall(id, resp) {
  return { type: SUCCESS_NETWORK_CALL, id, resp };
}

export function invalidateError(id) {
  return { type: INVALIDATE_ERROR, id };
}

export function errorNetworkCall(id, resp) {
  setTimeout(() => { dispatch(invalidateError(id)); }, 3000);
  return { type: ERROR_NETWORK_CALL, id, resp };
}

export function prepareUpload(files) {
  return { type: PREPARE_UPLOAD, files };
}

export function resetProgress(val) {
  return { type: RESET_PROGRESS, val };
}

export function onProgress(progressPacket) {
  dispatch({
    type: ON_PROGRESS,
    progressPacket,
  });
}

client.onProgress(onProgress);
