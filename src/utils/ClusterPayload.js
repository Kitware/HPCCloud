function tradClusterPayload(id) {
  if (!id) {
    throw Error('missing id in traditional cluster payload');
  }
  return {
    _id: id,
  };
}

function ec2ClusterPayload(name, machine, clusterSize = 1, profileId) {
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

export default function getClusterPayload(type, options) {
  if (type === 'EC2') {
    const { name, machine, clusterSize, profile, cluster } = options;
    if (cluster) {
      return { _id: cluster };
    }
    return ec2ClusterPayload(name, machine, clusterSize, profile);
  }
  if (type === 'Traditional') {
    const { profile } = options;
    return tradClusterPayload(profile);
  }
  return null;
}
