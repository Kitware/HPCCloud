export default function get(obj, prop){
  var parts = prop.split('.'),
    last = parts.pop();

  if (!obj) return;

  while (prop = parts.shift()) {
    obj = obj[prop];
    if (obj == null) return;
  }

  return obj[last];
}
