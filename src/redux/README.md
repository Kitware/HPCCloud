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
  },
  preferences: {
    clusters: {
      list: [
        { name, config, state }
      ],
      active: 0,
    },
    aws: {
      list: [],
      active: 0,
    }
  },
  taskflows: {
    234534: {
      tasks: {},
      jobs: {},
      status: {
        complete: 3,
        running: 2,
      }
    } 
  },
  projects: {
    35345: {
      id_, 
      name, 
      simulations: {
        567567: {
          id_,
          name, 
          description,
          steps: {

          },
          meta: {

          }
        }
      },
    }
  },
  active: {
    project: 35345,
    simulation: 567567,
  }
}
```
