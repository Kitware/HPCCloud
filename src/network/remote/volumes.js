import { transformRequest } from './utils';

const headers = {
  'Content-Type': 'application/json',
};

export default function ({ client, filterQuery, mustContain, encodeQueryAsString, busy }) {
  return {

    // get /volumes
    //     List available volumes.
    listVolumes(limit = null) {
      if (limit) {
        return busy(client._.get(`/volumes?limit=${limit}`));
      }
      return busy(client._.get('/volumes'));
    },

    // post /volumes
    //     Create a volume
    createVolume(volume) {
      return busy(client._.post('/volumes', volume, {
        transformRequest, headers,
      }));
    },

    // get /volumes/{id}
    //     Get a volume
    getVolume(id) {
      return busy(client._.get(`/volumes/${id}`));
    },

    // delete /volumes/{id}
    //     Delete a volume
    deleteVolume(id) {
      return busy(client._.delete(`/volumes/${id}`));
    },

    // get /volumes/{id}/log
    //     Get log entries for volume
    getVolumeLog(taskId, offset = 0) {
      if (offset) {
        return busy(client._.get(`/volumes/${taskId}/log?offset=${offset}`));
      }
      return busy(client._.get(`/volumes/${taskId}/log`));
    },

    // get /volumes/{id}/status
    //     Get the volume's current state
    getVolumeStatus(id) {
      return busy(client._.get(`/volumes/${id}/status`));
    },

    // put /volumes/{id}/attach/{cluster}
    //     Attach a volume to a cluster
    attachVolume(id, cluster) {
      return busy(client._.put(`/volumes/${id}/attach/${cluster}`));
    },

    // put /volumes/{id}/attach/{cluster}
    //     Detach a volume to a cluster
    detachVolume(id) {
      return busy(client._.put(`/volumes/${id}/detach`));
    },
  };
}
