# Troubleshooting

## Development

### A front-end feature I added is not showing up

Make sure that `npm start` is running and are you visiting the right address `localhost:9999`. 

### A workflow I added is not showing up in the project options

Make sure that you're importing your workflow description to `src/workflows/index.js` and exporting as a property of the variable `Workflows`. If this has not fixed it, make sure that the environment variable `NODE_ENV` is __not__ set to `test` the workflows directory will be ignored if it is.

### Cannot login

Make sure that girder is running on the target server. If it is running and you still cannot login, try restarting girder with `sudo service girder restart`. If you still cannot login, make sure your login exists and the `vagrant up` in HPCCloud-deploy ran successfully.

### Cannot connect to the Visualizer

Make sure that in `cumulus/cumulus/conf/config.json` the parameter `girder.baseUrl` matches the IP of the machine you're accessing the task from. User and group should be "cumulus".
