import girder from './GirderClient';

export function createTaskflow(taskFlowClass) {
  return girder.createTaskflow(taskFlowClass);
}

// GET /taskflows/{id} Get a taskflow
export function getTaskflow(id, path) {
  return girder.getTaskflow(id);
}

// PATCH /taskflows/{id} Update the taskflow
export function updateTaskflow(id, params) {
  return girder.updateTaskflow(id);
}

// DELETE /taskflows/{id} Delete the taskflow
export function deleteTaskflow(id) {
  return girder.deleteTaskflow(id);
}

// PUT /taskflows/{id}/start Start the taskflow
export function startTaskflow(id, cluster) {
  return girder.startTaskflow(id, cluster);
}

// GET /taskflows/{id}/status Get the taskflow status
export function getTaskflowStatus(id) {
  return girder.getTaskflowStatus(id);
}

// GET /taskflows/{id}/tasks Get all the tasks associated with this taskflow
export function getTaskflowTasks(id) {
  return girder.getTaskflowTasks(id);
}

// POST /taskflows/{id}/tasks Create a new task associated with this flow
export function createNewTaskForTaskflow(id, params) {
  return girder.createNewTaskForTaskflow(id);
}

// PUT /taskflows/{id}/terminate Terminate the taskflow
export function endTaskflow(id) {
  return girder.endTaskflow(id);
}
