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
      const expected = ['name', 'description', 'active', 'disabled', 'metadata', '_id'],
        sfiltered = filterQuery(simulation, ...expected.slice(0, 5)); // Remove '_id'

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
  };
}
