// GET /projects with two sample projects inside
export default [
  {
    _id: '574c84270640fd3f1a3b3747',
    access: {
      groups: [],
      users: [
        {
          id: '574c841b0640fd3f1a3b3741',
          level: 2,
        },
      ],
    },
    created: '2016-05-30T18:19:19.405000+00:00',
    description: '',
    folderId: '574c84270640fd3f1a3b3745',
    metadata: {
      inputFolder: {
        _id: '574c84270640fd3f1a3b3749',
        files: {},
      },
      outputFolder: {
        _id: '574c84270640fd3f1a3b3748',
        files: {},
      },
    },
    name: 'proj 1',
    steps: ['Introduction', 'Simulation', 'Visualization'],
    type: 'PyFrExec',
    updated: '2016-05-30T18:19:19.461000+00:00',
    userId: '574c841b0640fd3f1a3b3741',
  },
  {
    _id: '574f1e440640fd086c69303a',
    access: {
      groups: [],
      users: [
        {
          id: '574c841b0640fd3f1a3b3741',
          level: 2,
        },
      ],
    },
    created: '2016-06-01T17:41:24.468000+00:00',
    description: '',
    folderId: '574f1e440640fd086c693038',
    metadata: {
      inputFolder: {
        _id: '574f1e440640fd086c69303c',
        files: {},
      },
      outputFolder: {
        _id: '574f1e440640fd086c69303b',
        files: {},
      },
    },
    name: 'proj 2',
    steps: ['Introduction', 'Visualization'],
    type: 'Visualizer',
    updated: '2016-06-01T17:41:24.518000+00:00',
    userId: '574c841b0640fd3f1a3b3741',
  },
];
