// simulations for 'proj 1'
export default [
  {
    _id: '574c8aa00640fd3f1a3b379f',
    access: {
      groups: [],
      users: [
        {
          id: '574c841b0640fd3f1a3b3741',
          level: 2,
        },
      ],
    },
    active: 'Simulation',
    created: '2016-05-30T18:46:56.487000+00:00',
    description: 'will error',
    disabled: ['Visualization'],
    folderId: '574c8aa00640fd3f1a3b379b',
    metadata: {
      inputFolder: {
        _id: '574c8aa00640fd3f1a3b37a1',
        files: {
          ini: '574c8aa00640fd3f1a3b37a6',
          mesh: '574c8aa00640fd3f1a3b37a7',
        },
      },
      outputFolder: {
        _id: '574c8aa00640fd3f1a3b37a0',
        files: {},
      },
      status: 'complete',
    },
    name: 'sim001',
    projectId: '574c84270640fd3f1a3b3747',
    steps: {
      Introduction: {
        folderId: '574c8aa00640fd3f1a3b379c',
        metadata: {},
        status: 'created',
        type: 'information',
      },
      Simulation: {
        folderId: '574c8aa00640fd3f1a3b379e',
        metadata: {
          sessionId:
            'MC43NjU1MDAyMzYxNDc5NTI4LDAuMDYxMTY5Njg0NTE5NTAzMTEsMC43NDY1NzU1NDY2MTEwMjg0',
          taskflowId: '574c9d900640fd6e133b4b57',
        },
        status: 'created',
        type: 'output',
        view: 'run',
      },
      Visualization: {
        folderId: '574c8aa00640fd3f1a3b379d',
        metadata: {
          taskflowId: 'viz_taskflow_id',
        },
        status: 'created',
        type: 'output',
      },
    },
    updated: '2016-05-30T20:25:03.260000+00:00',
    userId: '574c841b0640fd3f1a3b3741',
  },
  {
    _id: '574ca0420640fd6e13b11e43',
    access: {
      groups: [],
      users: [
        {
          id: '574c841b0640fd3f1a3b3741',
          level: 2,
        },
      ],
    },
    active: 'Simulation',
    created: '2016-05-30T20:19:14.859000+00:00',
    description: 'error this!',
    disabled: ['Visualization'],
    folderId: '574ca0420640fd6e13b11e3f',
    metadata: {
      inputFolder: {
        _id: '574ca0420640fd6e13b11e45',
        files: {
          ini: '574ca0430640fd6e13b11e4a',
          mesh: '574ca0430640fd6e13b11e4b',
        },
      },
      outputFolder: {
        _id: '574ca0420640fd6e13b11e44',
        files: {},
      },
      status: 'terminated',
    },
    name: 'sim002',
    projectId: '574c84270640fd3f1a3b3747',
    steps: {
      Introduction: {
        folderId: '574ca0420640fd6e13b11e40',
        metadata: {},
        status: 'created',
        type: 'information',
      },
      Simulation: {
        folderId: '574ca0420640fd6e13b11e42',
        metadata: {
          sessionId:
            'MC4wOTE2NTY4MTY4MjMwOTA5LDAuMDcwOTkyOTM3NzIxODk2OTYsMC4xMjAyODE0OTE5NDg5NjU0Mg==',
          taskflowId: '574ca2670640fd6e134265e1',
        },
        status: 'created',
        type: 'output',
        view: 'run',
      },
      Visualization: {
        folderId: '574ca0420640fd6e13b11e41',
        metadata: {},
        status: 'created',
        type: 'output',
      },
    },
    updated: '2016-05-30T20:34:17.871000+00:00',
    userId: '574c841b0640fd3f1a3b3741',
  },
];
