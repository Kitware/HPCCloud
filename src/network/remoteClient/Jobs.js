import girder from './GirderClient';

export function getJobs(offset, limit) {
  return girder.getJobs(offset, limit);
}

// POST /jobs Create a new job
export function createJob(params) {
  return girder.createJob(params);
}

// GET /jobs/{id} Get a job
export function getJob(id) {
  return girder.getJob(id);
}

// PATCH /jobs/{id} Update the job
export function updateJob(id, params) {
  return girder.updateJob(id, params);
}

// DELETE /jobs/{id} Delete a job
export function deleteJob(id) {
  return girder.deleteJob(id);
}

// GET /jobs/{id}/log Get log entries for job
export function getJobLog(id, offset) {
  return girder.getJobLog(id, offset);
}

// GET /jobs/{id}/output Get output entries for job
export function getJobOutput(id, path, offset) {
  return girder.getJobOutput(id, path, offset);
}

// GET /jobs/{id}/status Get the status of a job
export function getJobStatus(id) {
  return girder.getJobStatus(id);
}

// PUT /jobs/{id}/terminate Terminate a job
export function terminateJob(id) {
  return girder.terminateJob(id);
}
