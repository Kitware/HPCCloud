import { transformRequest } from './utils';

const headers = {
  'Content-Type': 'application/json',
};

export default function ({ client, filterQuery, mustContain, busy }) {
  return {
    listProjects() {
      return busy(client._.get('/projects'));
    },

    createProject(project) {
      const expected = ['name', 'type', 'steps', 'metadata'],
        { missingKeys, promise } = mustContain(project, ...expected);
      return missingKeys ? promise : busy(client._.post('/projects', project));
    },

    getProject(id) {
      return busy(client._.get(`/projects/${id}`));
    },

    updateProject(project) {
      const expected = ['name', 'description', 'metadata', '_id'],
        pfiltered = filterQuery(project, ...expected.slice(0, 3)), // Remove '_id'
        { missingKeys, promise } = mustContain(project, ...expected);

      return missingKeys ?
        promise :
        busy(client._.patch(`/projects/${project._id}`, pfiltered, {
          headers, transformRequest,
        }));
    },

    deleteProject(id) {
      return busy(client._.delete(`/projects/${id}`));
    },

    shareProject(projectId, userId) {
      return busy(client._.put(`/projects/${projectId}/share`, { id: userId }));
    },

    unshareProject(projectId, userId) {
      console.log('unShareProject unimplemented');
      // return busy(client._.put(`/projects/${projectId}/unshare`, { id: userId }));
    },

    // List all the simulations associated with a project
    listSimulations(projectId) {
      return busy(client._.get(`/projects/${projectId}/simulations`));
    },

    // post /projects/{id}/simulations
    // Create a simulation associated with a project
    createSimulation(projectId, simualtion) {
      const expected = ['name', 'description', 'steps', 'active', 'disabled'],
        sfiltered = filterQuery(simualtion, ...expected);

      return busy(client._.post(`/projects/${projectId}/simulations`, sfiltered, {
        headers, transformRequest,
      }));
    },
  };
}
