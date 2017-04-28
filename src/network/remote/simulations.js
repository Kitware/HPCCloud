import { transformRequest } from './utils';

const headers = {
  'Content-Type': 'application/json',
};

export default function ({ client, filterQuery, mustContain, busy }) {
  return {
    getSimulation(id) {
      return busy(client._.get(`/simulations/${id}`));
    },

    editSimulation(simulation) {
      const expected = ['name', 'description', 'active', 'disabled', 'metadata', 'steps'],
        sfiltered = filterQuery(simulation, ...expected);

      return busy(client._.patch(`/simulations/${simulation._id}`, sfiltered, {
        headers, transformRequest,
      }));
    },

    deleteSimulation(id) {
      return busy(client._.delete(`/simulations/${id}`));
    },

    cloneSimulation(id, { name = 'Cloned simulation' }) {
      return busy(client._.post(`/simulations/${id}/clone`),
        { name },
        { headers, transformRequest });
    },

    downloadSimulation(id) {
      return busy(client._.get(`/simulations/${id}/download`));
    },

    getSimulationStep(id, name) {
      return busy(client._.get(`/simulations/${id}/steps/${name}`));
    },

    updateSimulationStep(id, name, step) {
      return busy(client._.patch(`/simulations/${id}/steps/${name}`, step, {
        headers, transformRequest,
      }));
    },

    shareSimulation(_id, users, groups, flags = []) {
      return busy(client._.put(`/simulations/${_id}/share`, { users, groups, flags }));
    },

    unshareSimulation(_id, users, groups) {
      return busy(client._.put(`/simulations/${_id}/unshare`, { users, groups }));
    },
  };
}
