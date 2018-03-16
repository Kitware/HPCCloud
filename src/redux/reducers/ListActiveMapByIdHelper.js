export const initialState = {
  list: [],
  active: null,
  mapById: {},
};

export function updateList(state, itemList, idKey = '_id') {
  const list = [];
  const mapById = {};
  itemList.forEach((item) => {
    list.push(item[idKey]);
    mapById[item[idKey]] = item;
  });

  const active = mapById[state.active] ? state.active : null;
  return Object.assign({}, state, { list, mapById, active });
}

export function removeItem(state, id) {
  let mapById = state.mapById;
  if (mapById && mapById[id]) {
    mapById = Object.assign({}, state.mapById);
    delete mapById[id];
  }
  if (state.list.indexOf(id) !== -1) {
    const list = state.list.filter((item) => item !== id);
    const active = state.active === id ? null : state.active;
    if (mapById) {
      return Object.assign({}, state, { list, active, mapById });
    }
    return Object.assign({}, state, { list, active });
  }
  return state;
}

export function updateItem(state, item, idKey = '_id') {
  const itemId = item[idKey];
  const list =
    state.list.indexOf(itemId) === -1
      ? [itemId].concat(state.list)
      : state.list;
  const mapById = Object.assign({}, state.mapById, { [itemId]: item });
  return Object.assign({}, state, { list, mapById });
}

export function updateActive(state, id) {
  return Object.assign({}, state, { active: id });
}

export default {
  updateList,
  removeItem,
  updateItem,
  initialState,
  updateActive,
};
