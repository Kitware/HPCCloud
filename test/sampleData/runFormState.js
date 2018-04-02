export default {
  EC2: {
    profile: 'ec2Id',
    machine: {
      id: 't2.nano',
      cpu: '1',
      memory: '0.5 GiB',
      storage: 'EBS only',
      family: 'General purpose',
      price: '0.0065000000',
      gpu: 0,
    },
    clusterSize: '',
    volumeSize: '',
    cluster: null,
  },
  Traditional: {
    profile: 'tradId',
    runtime: {
      numberOfGpusPerNode: 1,
      numberOfSlots: 1,
      queue: '',
    },
  },
};
