export function tradClusterPayload(id) {
  if (!id) {
    throw Error('missing id in traditional cluster payload');
  }
  return {
    _id: id,
  };
}

export function ec2ClusterPayload(name, machine, clusterSize = 1, profileId) {
  if (typeof name === 'undefined') {
    throw Error('Missing required field: "name"');
  } else if (typeof machine === 'undefined') {
    throw Error('Missing required field: "machine"');
  } else if (typeof profileId === 'undefined') {
    throw Error('Missing required field: "profileId"');
  }

  let _clusterSize = parseFloat(clusterSize);
  if (isNaN(_clusterSize)) {
    _clusterSize = 1;
  } else if (clusterSize <= 0) {
    throw Error('Cluster size cannot be ≤ 0');
  }

  return {
    serverType: 'ec2',
    name,
    machine,
    clusterSize: _clusterSize,
    profileId,
  };
}

export default {
  tradClusterPayload,
  ec2ClusterPayload,
};
