import girder from './GirderClient';

export function downloadItem(id, offset, endByte, contentDisposition) {
  return girder.downloadItem(id, offset, endByte, contentDisposition);
}
export function updateItemMetadata(id, metadata = {}) {
  return girder.updateItemMetadata(id, metadata);
}

// query = { folderId, text, limit, offset, sort, sortdir }
export function listItems(query = {}) {
  return girder.listItems(query);
}

export function createItem(folderId, name, description = '') {
  return girder.createItem(folderId, name, description);
}

// query = { limit, offset, sort }
export function listFiles(id, query) {
  return girder.listFiles(id, query);
}

export function getItemRootPath(id) {
  return girder.getItemRootPath(id);
}

export function getItem(id) {
  return girder.getItem(id);
}

export function deleteItem(id) {
  return girder.deleteItem(id);
}

// item = { id, folderId, name, description }
export function editItem(item) {
  return girder.editItem(item);
}

// destinationItem = { folderId, name, description }
export function copyItem(id, destinationItem) {
  return girder.copyItem(id, destinationItem);
}
