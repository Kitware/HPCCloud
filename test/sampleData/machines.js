export default {
  'eu-central-1': {
    'General purpose': [
      {
        id: 't2.nano',
        cpu: '1',
        memory: '0.5 GiB',
        storage: 'EBS only',
        family: 'General purpose',
        price: '0.0075000000',
        gpu: 0,
      },
    ],
    'Storage optimized': [
      {
        id: 'i2.xlarge',
        cpu: '4',
        memory: '30.5 GiB',
        storage: '1 x 800 SSD',
        family: 'Storage optimized',
        price: '1.0130000000',
        gpu: 0,
      },
      {
        id: 'd2.xlarge',
        cpu: '4',
        memory: '30.5 GiB',
        storage: '3 x 2000 HDD',
        family: 'Storage optimized',
        price: '0.7940000000',
        gpu: 0,
      },
    ],
  },
  'us-west-2': {
    'General purpose': [
      {
        id: 't2.nano',
        cpu: '1',
        memory: '0.5 GiB',
        storage: 'EBS only',
        family: 'General purpose',
        price: '0.0100000000',
        gpu: 0,
      },
      {
        id: 't2.micro',
        cpu: '1',
        memory: '1 GiB',
        storage: 'EBS only',
        family: 'General purpose',
        price: '0.0200000000',
        gpu: 0,
      },
    ],
    'Storage optimized': [
      {
        id: 'i2.xlarge',
        cpu: '4',
        memory: '30.5 GiB',
        storage: '1 x 800 SSD',
        family: 'Storage optimized',
        price: '0.8530000000',
        gpu: 0,
      },
      {
        id: 'd2.xlarge',
        cpu: '4',
        memory: '30.5 GiB',
        storage: '3 x 2000 HDD',
        family: 'Storage optimized',
        price: '0.6900000000',
        gpu: 0,
      },
    ],
  },
};
