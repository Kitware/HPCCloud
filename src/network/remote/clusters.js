import deepClone from 'mout/src/lang/deepClone';
import { getJSON, transformRequest } from './utils';

const headers = {
  'Content-Type': 'application/json',
};

export default function ({ client, filterQuery, mustContain, encodeQueryAsString, busy }) {
  return {

    // get /clusters
    //     Search for clusters with certain properties (type: 'trad' || 'ec2')
    //     TODO: limit and offset argument.
    listClusters(type = null) {
      if (type) {
        return busy(client._.get(`/clusters?type=${type}`));
      }
      return busy(client._.get('/clusters'));
    },

    // post /clusters
    //     Create a cluster
    createCluster(cluster) {
      return busy(client._.post('/clusters', cluster, {
        transformRequest, headers,
      }));
    },

    // get /clusters/{id}
    //     Get a cluster
    getCluster(id) {
      return busy(client._.get(`/clusters/${id}`));
    },

    getClusterPresets() {
      return getJSON('/clusters-presets.json');
    },

    // patch /clusters/{id}
    //     Update the cluster
    updateCluster(cluster) {
      const editableCluster = deepClone(cluster),
        allowed = ['name', 'type', 'config', '_id'],
        params = filterQuery(editableCluster, ...allowed.slice(0, 3));

      // Remove read only fields if any
      if (editableCluster.config.ssh && editableCluster.config.ssh.user) {
        delete editableCluster.config.ssh.user;
      }
      if (editableCluster.config.host) {
        delete editableCluster.config.host;
      }

      return busy(client._.patch(`/clusters/${cluster._id}`, params, {
        transformRequest, headers,
      }));
    },

    // delete /clusters/{id}
    //     Delete a cluster and its configuration
    deleteCluster(id) {
      return busy(client._.delete(`/clusters/${id}`));
    },

    // put /clusters/{id}/job/{jobId}/submit
    //     Submit a job to the cluster
    submitJob(clusterId, jobId) {
      return busy(client._.put(`/clusters/${clusterId}/job/${jobId}/submit`));
    },

    // get /clusters/{id}/log
    //     Get log entries for cluster
    getClusterLog(taskId, offset = 0) {
      if (offset) {
        return busy(client._.get(`/clusters/${taskId}/log?offset=${offset}`));
      }
      return busy(client._.get(`/clusters/${taskId}/log`));
    },

    // PUT /clusters/{id}/provision Provision a cluster with ansible
    provisionCluster(id, params) {
      return busy(client._.put(`/clusters/${id}/provision`, params));
    },

    // put /clusters/{id}/start
    //     Start a cluster (ec2 only)
    startCluster(id) {
      return busy(client._.put(`/clusters/${id}/start`));
    },

    // alias for startClusters
    testCluster(id) {
      return busy(client._.put(`/clusters/${id}/start`));
    },

    // get /clusters/{id}/status
    //     Get the clusters current state
    getClusterStatus(id) {
      return busy(client._.get(`/clusters/${id}/status`));
    },

    // put /clusters/{id}/terminate
    //     Terminate a cluster
    terminateCluster(id) {
      return busy(client._.put(`/clusters/${id}/terminate`));
    },
  };
}
