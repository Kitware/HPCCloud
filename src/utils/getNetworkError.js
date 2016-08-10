import get from './get';

// checks the network errors, if there is a valid one it returns the error's message,
// if there's no message it returns the status code and the status text
function getNetworkErrorWithId(state, id) {
  if (get(state, `network.error.${id}`) && !get(state, `network.error.${id}.invalid`)) {
    if (get(state, `network.error.${id}.resp.data.message`)) {  // resp.data.message
      return get(state, `network.error.${id}.resp.data.message`);
    } else if (get(state, `network.error.${id}.resp.message`)) { // resp.message
      return get(state, `network.error.${id}.resp.message`);
    }
    return `Error ${state.network.error[id].resp.status} (${state.network.error[id].resp.statusText})`; // status text
  }
  return '';
}

function getNetworkErrorWithArray(state, ids) {
  for (let i = 0; i < ids.length; i++) {
    const message = getNetworkErrorWithId(state, ids[i]);
    if (message) {
      return message;
    }
  }
  return '';
}

export default function getNetworkError(state, id) {
  if (Array.isArray(id)) {
    return getNetworkErrorWithArray(state, id);
  }
  return getNetworkErrorWithId(state, id);
}
