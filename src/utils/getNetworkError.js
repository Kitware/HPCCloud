import get from './get';

// checks the network errors, if there is a valid one it returns the error's message
export default function getNetworkError(state, id) {
  if (get(state, `network.error.${id}.resp.data.message`) &&
    !get(state, `network.error.${id}.invalid`)) {
    return get(state, `network.error.${id}.resp.data.message`);
  }
  return '';
}
