
function isObject(val) {
  return typeof val === 'object' &&
    !Array.isArray(val) &&
    !(val instanceof RegExp) &&
    !(val instanceof String) &&
    !(val instanceof Number);
}

export default function deepFreeze(obj) {
  Object.keys(obj).forEach((key) => {
    var el = obj[key];
    if (isObject(el)) {
      deepFreeze(obj[key]);
    }
  });
  return Object.freeze(obj);
}
