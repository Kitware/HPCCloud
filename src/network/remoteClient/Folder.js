import girder from './GirderClient';

export function listFolders(query = {}) {
  return girder.listFolders(query);
}

export function createFolder(folder) {
  return girder.createFolder(folder);
}

export function editFolderMetaData(id, metadata) {
  return girder.editFolderMetaData(id, metadata);
}

export function deleteFolder(id) {
  return girder.deleteFolder(id);
}

export function getFolder(id) {
  return girder.getFolder(id);
}

export function editFolder(folder) {
  return girder.editFolder(folder);
}

export function downloadFolder(id) {
  return girder.downloadFolder(id);
}

export function getFolderAccess(id) {
  return girder.getFolderAccess(id);
}

export function editFolderAccess(folder) {
  return girder.editFolderAccess(folder);
}
