# Adding new workflows

There are front end and back end requirements for workflows. 

## Workflow definition on the front end

At the core of workflows is a JSON structured file. The file defines components and labels of a workflow. Below is the definition for the Visualizer workflow segmented for annotation.

```js
import rootNewSimulation    from './components/root/NewSimulation';
import rootViewSimulation   from './components/root/ViewSimulation';

import stepIntroduction     from './components/steps/Introduction';
import stepStartViz         from './components/steps/Visualization/Start';
import stepVisualizer       from './components/steps/Visualization/View';

```

Imported views for the workflow. These are all referenced in the object that's exported from this file.

```js
export default {
  name: 'ParaViewWeb',
  logo: require('./logo.png'),
  components: {
    NewSimulation: rootNewSimulation,
    ViewSimulation: rootViewSimulation,
  },
```

In the `components` object, `NewSimulation` is a view which goes below the "Name" and "Description" fields in a new simulaiton view. They're often where you'll see file upload inputs. `ViewSimulation` is the root component for containing the workflow. It's usually an `ActiveList` panel with the Workflow's steps and the views corresponding to the Workflow step.

`logo` it not required but helps visually distinguish projects in the projects list.

```js
  config: {
    cluster: {
      'config.paraview.installDir': {
        type: 'text',
        label: 'ParaView Directory',
        description: 'Path to the home directory of ParaView.',
      },
    },
  },
```

Extra config options which are appended to the run simulaiton view.

```js
  steps: {
    _order: ['Introduction', 'Visualization'],
    _initial_state: {
      Introduction: {
        type: 'information',
        metadata: {
          alwaysAvailable: true,
        },
      },
      Visualization: {
        type: 'output',
        metadata: {
          disabled: false,
        },
      },
    },
    Introduction: {
      default: stepIntroduction,
    },
    Visualization: {
      default: stepStartViz,
      run: stepVisualizer,
    },
  },
```
Workflow step definition. `_order` determines the step order in the `ActiveList` the strings here must match the keys of the steps. `_initial_state` defines if the step is enabled or disabled. #FIXME type isn't used for anything?

`Introduction` and `Visualization` are the step definitions. Within them you can define multiple views. `default` is the default view the user will see when they first open that step, here it's `stepStartViz` which is imported above. Here the `run` step defines the view which you see when the simulation is running. 

```js
  taskFlows: {
    Visualization: 'hpccloud.taskflow.paraview.ParaViewTaskFlow',
  },
```

The keys in `taskFlows` correspond to step names and the value corresponds to a python path class which the backend of HPCCloud uses to run the step's taskflow on a target machine.

```js
  primaryJobs: {
    Visualization: 'paraview',
  },
```

The keys in 'primaryJobs' are the step names, the value is the name of the job which runs on the target machine.

```js
  labels: {
    Introduction: {
      default: 'Introduction',
    },
    Visualization: {
      default: 'Visualization',
      run: 'Visualization (running)',
    },
  },
};
// end of workflow definition
```

Labels for the steps and step subviews.

