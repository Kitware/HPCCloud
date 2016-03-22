export function setPathTo(object, path, value) {
  var currentContainer = object || {};
  var keyPath = path.split('.');
  const lastKey = keyPath.pop();

  while (keyPath.length) {
    const nextKey = keyPath.shift();
    if (!currentContainer[nextKey]) {
      currentContainer[nextKey] = {};
    }
    currentContainer = currentContainer[nextKey];
  }

  currentContainer[lastKey] = value;
}
