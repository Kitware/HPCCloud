# Workflow pages

Each workflow has a set of steps, those steps have pages associated with them. For most cases there are at least two pages: 

- Input, a Simput panel for modifiying or creating the simulation input.
- Submission, starts the job
- Monitor, monitors the job

These pages can be built off the components in: 

```sh
src/workflows/generic/components/steps
```

## Input

Import the component `generic/components/steps/SimputReact` and pass the following props: 

- `simputType`, the name of the simput type
- `initialDataModel`, the initial data model for simput. Of format:  
  ```js
    {
      data: {},
      type: `${simput_type_name}`,
      hideViews: [], // strings of the view names you would like to hide
    }
  ```

- `simputModelDecorator`, a function which takes model and props and extends the data model if desired.


## Submission

Submit a taskflow to a cluster or EC2 instance. You can provision EC2 clusters and volumes from the forms on this panel. Import component `generic/components/steps/JobSubmission' and pass the following props: 

- `addOn`, a form addon to pass extra parameters to the cluster
- `actionList`, potential actions for the form, for the Submission step it's usually just a start simulation action.
- `clusterFilter`, a function which takes a cluster and returns a boolean whether or not it should be included in the list to be run.
- `getPayload`, a function which takes `props` and `state` and returns a payload for the taskflow.
- `{ ...props }` Inherit any props comming from the parent componnent.
- You can pass more props throgh the redux connect function.

## Monitor

Monitor and keep track of the running taskflow with its jobs and tasks. Import `generic/components/steps/JobMonitoring` and provide the following props through the redux connect function (which takes `state`). 

- `getActions`, a function which takes props and gets the actions available in the taskflow.
- `taskflow`, the current state taskflow for the active project
- `taskflowId`, the id of the current taskflow
- `cluster`, the cluster of the currently running taskflow
- `disabledButtons`,  getDisabledButtons(state.network, taskflow),
- `error`, use the utility function `getNetworkError(state, ['terminate_taskflow', 'delete_taskflow'])`, this will show any errors that `delete_taskflow` or `terminate_taskflow` should emit. You can have it catch more errors by checking the tag that the network call uses in the redux stack.
- `actionFunctions`, additional actions, usually to take the user to the next step in the workflow.

## Examples

You can find an example of each of these steps in the PyFR workflow at `src/workflows/pyfr`
