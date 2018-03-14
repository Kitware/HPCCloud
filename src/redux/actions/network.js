import client from '../../network';
import { dispatch } from '../';

export const ADD_NETWORK_CALL = 'ADD_NETWORK_CALL';
export const SUCCESS_NETWORK_CALL = 'SUCCESS_NETWORK_CALL';
export const ERROR_NETWORK_CALL = 'ERROR_NETWORK_CALL';
export const INVALIDATE_ERROR = 'INVALIDATE_ERROR';
export const INVALIDATE_ERRORS = 'INVALIDATE_ERRORS';
export const PREPARE_UPLOAD = 'PREPARE_UPLOAD';
export const RESET_UPLOAD_PROGRESS = 'RESET_UPLOAD_PROGRESS';
export const ON_UPLOAD_PROGRESS = 'ON_UPLOAD_PROGRESS';

/* eslint-disable no-shadow */

export function addNetworkCall(id, label = '') {
  const ts = +new Date();

  return {
    type: ADD_NETWORK_CALL,
    id,
    label,
    ts,
  };
}

export function successNetworkCall(id, resp) {
  return { type: SUCCESS_NETWORK_CALL, id, resp };
}

export function invalidateError(id, errType = 'application') {
  return { type: INVALIDATE_ERROR, id, errType };
}

// takes an array of ids which the reducer then invalidates all of
export function invalidateErrors(ids, errType = 'application') {
  return { type: INVALIDATE_ERRORS, ids, errType };
}

export function errorNetworkCall(id, resp, errType = 'application') {
  var errorTimeout = setTimeout(() => {
    dispatch(invalidateError(id));
  }, 5000);
  return { type: ERROR_NETWORK_CALL, id, resp, errorTimeout, errType };
}

export function prepareUpload(files) {
  return { type: PREPARE_UPLOAD, files };
}

export function resetProgress(val) {
  return { type: RESET_UPLOAD_PROGRESS, val };
}

export function onProgress(progressPacket) {
  dispatch({
    type: ON_UPLOAD_PROGRESS,
    progressPacket,
  });
}

client.onProgress(onProgress);
