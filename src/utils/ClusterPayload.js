function tradClusterPayload(id) {
  if (!id) {
    throw Error('missing id in traditional cluster payload');
  }
  return {
    _id: id,
  };
}

function ec2ClusterPayload(name, machine, clusterSize = 1, profileId, clusterNames) {
  if (typeof name === 'undefined') {
    throw Error('Missing required field: "name"');
  } else if (typeof machine === 'undefined') {
    throw Error('Missing required field: "machine"');
  } else if (typeof profileId === 'undefined') {
    throw Error('Missing required field: "profileId"');
  } else if (clusterNames.includes(name.trim())) {
    throw Error('An EC2 instance with this name already exists');
  }

  let _clusterSize = parseFloat(clusterSize);
  if (isNaN(_clusterSize)) {
    _clusterSize = 1;
  } else if (clusterSize <= 0) {
    throw Error('Cluster must be greater than zero');
  }

  return {
    serverType: 'ec2',
    machine,
    name: name.trim(),
    clusterSize: _clusterSize,
    profileId,
  };
}

export default function getClusterPayload(type, options, clusterNames) {
  if (type === 'EC2') {
    const { name, machine, clusterSize, profile, cluster } = options;
    if (cluster) {
      return { _id: cluster };
    }
    return ec2ClusterPayload(name, machine, clusterSize, profile, clusterNames);
  }
  if (type === 'Traditional') {
    const { profile } = options;
    return tradClusterPayload(profile);
  }
  return null;
}
