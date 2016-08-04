import get from './get';

// checks the network errors, if there is a valid one it returns the error's message
function getNetworkErrorWithId(state, id) {
  if (get(state, `network.error.${id}.resp.data.message`) &&
    !get(state, `network.error.${id}.invalid`)) {
    return get(state, `network.error.${id}.resp.data.message`);
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
