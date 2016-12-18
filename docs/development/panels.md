# Panels

Panels are React components which are used in more than one place. These are as opposed to pages which are added once to the React-Router config, and contain Panels.

## Nesting

With the reusability of panels they can get very nested. The image below illustrates panel nesting within a workflow step component.

![form panels](images/form-panels.png)

Each panel here is a form, the data in each subform is passed to it by the parent component and bubbles up on a change though an onChange function.

## Common panels

### `ButtonBar`

Used in other panels, `ButtonBar` takes a list of actions which it renders as buttons. It can also take a child element which it will display the the right of the buttons. The child element is typically used to display errors.

### `ActiveList`

A list of elements the user can select.

### `JobMonitor`

This is primarily used in workflows to view the progress and status of a simulation.

### `Toolbar`

This is the toolbar just below the top most header. It contains a Breadcrumb component, and takes title and actions as properties which are rendered center and right respectively.

### `Run / RunClusterForm / RunEC2Form`

The root component 'Run' determines which form to render, either RunClusterForm or RunEC2 form. This panel is used in the Start step of workflows.

### `RuntimeBackend`

This panel presents backend settings for CUDA, OpenCL, and OpenMP. For CUDA it sets the device id to Round Robin or Local Rank. For OpenMP and OpenCL you can select a cluster profile which you can configure for a cluster on the Cluster Preferences page.

### `SchedulerConfig`

For each scheduler PBS, SGE, and SLURM it renders a set of form fields that the scheduler requires. The default of these forms is: 

```json
{
  type: 'sge',
  maxWallTime: { hours: 0, minutes: 0, seconds: 0 },
  defaultQueue: '',
  sge: {
    numberOfGpusPerNode: 0,
    numberOfSlots: 1,
  },
  slurm: {
    numberOfGpusPerNode: 0,
    numberOfCoresPerNode: 1,
    numberOfNodes: 1,
  },
  pbs: {
    numberOfGpusPerNode: 0,
    numberOfCoresPerNode: 1,
    numberOfNodes: 1,
  },
}
```

This panel is used on the Start step of simulations and for clusters on the Cluster Preferences page.
