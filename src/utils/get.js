/* eslint-disable no-cond-assign */
export default function get(obj, prop) {
  let container = obj;
  let propName = prop;
  const parts = prop.split('.');
  const last = parts.pop();
  const falseyReturn = last === 'length' ? 0 : false;

  if (!container) {
    return falseyReturn;
  }

  while ((propName = parts.shift())) {
    container = container[propName];
    if (container == null) {
      return falseyReturn;
    }
  }

  // we don't want to return undefined
  if (container[last] == null) {
    return falseyReturn;
  }

  return container[last];
}

/* we use `get` a lot to check for objects' contents,
 * mout's `get` throws an error if we give it an undefined object
 * this addresses that use case */
