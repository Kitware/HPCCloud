export function tradClusterPayload(id) {
  if (!id) {
    throw Error('missing id in traditional cluster payload');
  }
  return {
    _id: id,
  };
}

export function ec2ClusterPayload(name, machineType, clusterSize = 1, profileId) {
  if (!name) {
    throw Error('missing `name` in ec2 cluster payload');
  } else if (!machineType) {
    throw Error('missing `machineType` in ec2 cluster payload');
  } else if (!profileId) {
    throw Error('missing `profileId` in ec2 cluster payload');
  }

  let _clusterSize = parseFloat(clusterSize);
  if (isNaN(_clusterSize)) {
    _clusterSize = 1;
  } else if (clusterSize <= 0) {
    throw Error('clusterSize cannot be ≤ 0');
  }

  return {
    serverType: 'ec2',
    name,
    machineType,
    clusterSize: _clusterSize,
    profileId,
  };
}

export default {
  tradClusterPayload,
  ec2ClusterPayload,
};
