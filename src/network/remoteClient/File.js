import girder from './GirderClient';

export function getUploadOffset(id) {
  return girder.getUploadOffset(id);
}

export function downloadFile(id, offset, endByte, contentDisposition) {
  return girder.downloadFile(id, offset, endByte, contentDisposition);
}

export function uploadChunk(id, offset, chunk) {
  return girder.uploadChunk(id, offset, chunk);
}

export function updateFileContent(id, size) {
  return girder.updateFileContent(id, size);
}

export function deleteFile(id) {
  return girder.deleteFile(id);
}

export function editFile(file) {
  return girder.editFile(file);
}

export function newFile(file) {
  return girder.newFile(file);
}
