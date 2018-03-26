let query = {};

const filterKeys = {
  't:': 'type',
  'n:': 'name',
  'd:': 'description',
};

function findActiveKey(token) {
  let key = null;
  Object.keys(filterKeys).forEach((k) => {
    if (token.indexOf(k) === 0) {
      key = k;
    }
  });
  return key;
}

export function updateQuery(queryStr = '') {
  const tokens = queryStr.split(' ');
  let activeToken = null;
  let previousFilterKey = null;
  let activeFilterKey = null;

  // Reset query
  query = {};

  while (tokens.length) {
    activeToken = tokens.shift();
    activeFilterKey = findActiveKey(activeToken);

    if (!activeFilterKey) {
      activeFilterKey = previousFilterKey || 'n:';
    } else {
      activeToken = activeToken.substr(activeFilterKey.length);
    }

    previousFilterKey = activeFilterKey;

    if (!query[filterKeys[activeFilterKey]]) {
      query[filterKeys[activeFilterKey]] = [];
    }

    query[filterKeys[activeFilterKey]].push(activeToken.toLowerCase());
  }

  return query;
}

export function itemFilter(item, index, array) {
  let keep = true;

  Object.keys(query).forEach((key) => {
    query[key].forEach((token) => {
      keep = keep && item[key].toLowerCase().indexOf(token) !== -1;
    });
  });

  return keep;
}
