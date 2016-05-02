# Store structure

```js
{
  auth: {
    pending: false,
    user: {},
  },
  network: {
    pending: {
      [id] : { id, name, progress },
    },
    success: {},
    error: {},
    backlog: [ {contents of outdated pending, success, and errors} ],
    progress: { [fileId]: {current: number, total: number}, ... }
    progressReset: bool
  },
  preferences: {
    clusters: {
      pending: false,
      list: [
        { name, config, status }
      ],
      active: 0,
      mapById: {
        [_id]: { name, config, status,
          logStream: EventSource,
          log: []
        },
      }
      presets: {
        [name]: { prop: value, ... }
      }
    },
    aws: {
      pending: false,
      list: [],
      active: 0,
      mapById: {
        [_id]: { },
      }
    },
    statuses: {
      clusters: [ {...} ],
      ec2: [ {...} ],
    }
  },
  taskflows: {
    mapById: {
      [id]: {
        flow: { taskflow... },
        taskMapById: {
          [id] : { task... }
        },
        jobMapById: {
          [id] : { job... }
        },
        log: [ ...log entries ],
        simulation: id,
        primaryJob: 'pyfr_run',
        stepName: 'Simulation', // Only provided for primaryJob retreival
        actions: [ 'rerun', 'terminate' ],
        allComplete: false,
        outputDirectory: '/opt/hpccloud-jobs/23452345234',
      }
    },
    taskflowMapByTaskId: {
      [taskId]: ${taskflowId},
    },
    taskflowMapByJobId: {
      [jobId]: ${taskflowId},
    },
    updateLogs: [ taskflowId, ... ],
  },
  projects: {
    workflowNames: [{ label: 'Saturn', value: 'saturn' }, ...],
    list: [ '2345', '3456345' ],
    active: '2345', // or null
    mapById: {
      '2345' : {
        _id: 2345,
        name: 'sdfsdf',
        description: '',
      }
    },
    simulations: {
      [project id]: {
        list: ['2345', '567657'],
        active: '2345',
      }
    }
  },
  simulations: {
    mapById: {
      [simId]: { ...full simulation object }
    }
  },
  fs: {
    folderMapById: {
      [id]: {
        open: false,
        folder: { full folder... },
        folderChildren: [ ids... ],
        itemChildren: [ ids... ], 
      }
    },
    itemMapById: {
      [id]: { fullItem },
    }
  }
}
```
