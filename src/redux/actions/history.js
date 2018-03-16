let history = null;

export function setHistory(h) {
  history = h;
}

export function getHistory() {
  return history;
}

export function push(path, state) {
  if (history) {
    history.push(path, state);
  }
}

export function replace(path, state) {
  if (history) {
    history.replace(path, state);
  }
}

export function go(n) {
  if (history) {
    history.go(n);
  }
}

export function goBack() {
  if (history) {
    history.goBack();
  }
}

export function goForward() {
  if (history) {
    history.goForward();
  }
}

export default {
  push,
  replace,
  go,
  goBack,
  goForward,
};
