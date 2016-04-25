import client           from '../../network';
import { dispatch }     from '../index.js';

export const ADD_NETWORK_CALL = 'ADD_NETWORK_CALL';
export const SUCCESS_NETWORK_CALL = 'SUCCESS_NETWORK_CALL';
export const ERROR_NETWORK_CALL = 'ERROR_NETWORK_CALL';
export const PROGRESS_NETWORK_CALL = 'PROGRESS_NETWORK_CALL';
export const INVALIDATE_ERROR = 'INVALIDATE_ERROR';
export const ON_PROGRESS = 'ON_PROGRESS';

/* eslint-disable no-shadow */

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

export function invalidateError(id) {
  return {
    type: INVALIDATE_ERROR,
    id,
  };
}

export function onProgress(progressPacket) {
  const progress = (progressPacket.current / progressPacket.total) * 100;
  const progressReset = progressPacket.progressReset || false;
  // a delay for the progressBar to be full and then fade.
  if (progress === 100) {
    // let the bar's opacity fade: 1.5s delay, 1s duration (see Theme.mcss)
    setTimeout(() => { onProgress({ current: 0, total: 1, progressReset: true }); }, 2500);
  } else if (progressReset) {
    // when progressReset, the bar's display is 'none',
    // it takes 2.5s for width & opacity to fade back to initial values to transition .
    setTimeout(() => { onProgress({ current: 0, total: 1, progressReset: false });}, 2500);
  }
  dispatch({
    type: ON_PROGRESS,
    progress, progressReset,
  });
}

client.onProgress(onProgress);
