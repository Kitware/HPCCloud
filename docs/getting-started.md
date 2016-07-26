# Getting Started

Consult the full initial setup instructions on the [HPCCloud-deploy repository](https://github.com/Kitware/HPCCloud-deploy) and then come back here.

With your VM up and running: 

- `localhost:8080`: Girder 
- `localhost:8888`: HPC-Cloud

## Development: 

With the environment variable `DEVELOPMENT=1`, in your HPC-Cloud directory run:

```
$ npm start
```

This will run a webpack-dev server on `localhost:9999` which will reflect local changes to HPC-Cloud as you make them.
