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

    getAccess(_id) {
      return busy(client._.get(`/simulations/${_id}/access`));
    },

    setAccess(_id, users, groups, level, flags = []) {
      return busy(client._.put(`/simulations/${_id}/access`, { users, groups, level, flags }));
    },

    patchAccess(_id, users, groups, level, flags = []) {
      return busy(client._.patch(`/simulations/${_id}/access`, { users, groups, level, flags }));
    },

    revokeSimulation(_id, users, groups) {
      return busy(client._.delete(`/simulations/${_id}/access`, { users, groups }));
    },
  };
}
