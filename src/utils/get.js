/* eslint-disable */
export default function get(obj, prop) {
  var parts = prop.split('.'),
    last = parts.pop();

  if (!obj) return;

  while (prop = parts.shift()) {
    obj = obj[prop];
    if (obj == null) {
      return false;
    }
  }

  return obj[last];
}

/* we use `get` a lot to check for objects' contents,
 * mout's `get` throws an error if we give it an undefined object
 * this addresses that use case */
