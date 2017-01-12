import rootViewSimulation   from './components/root/ViewSimulation';

import stepIntroduction       from './components/steps/Introduction';
import stepInput              from './components/steps/Input';
import stepSimulationStart    from './components/steps/Simulation/Start';
import stepSimulationView     from './components/steps/Simulation/View';
import stepVisualizationStart from './components/steps/Visualization/Start';
import stepVisualizationView  from './components/steps/Visualization/View';

export default {
  name: 'OpenFoam',
  logo: require('./logo.png'),
  requiredAttachments: {
    project: [],
    simulation: [],
  },
  components: {
    ViewSimulation: rootViewSimulation,
  },
  config: {
    cluster: {
      'config.openfoam.enable': {
        type: 'bool',
        label: 'OpenFoam enabled',
        description: 'Check if the cluster is able to run OpenFoam simulation',
      },
    },
  },
  steps: {
    _order: ['Introduction', 'Input', 'Simulation', 'Visualization'],
    _disabled: ['Visualization'],
    _initial_state: {
      Introduction: {
        type: 'input',
        metadata: {
          alwaysAvailable: true,
        },
      },
      Input: {
        type: 'input',
        metadata: {},
      },
      Simulation: {
        type: 'output',
        metadata: {},
      },
      Visualization: {
        type: 'output',
        metadata: {},
      },
    },
    Introduction: {
      default: stepIntroduction,
    },
    Input: {
      default: stepInput,
    },
    Simulation: {
      default: stepSimulationStart,
      run: stepSimulationView,
    },
    Visualization: {
      default: stepVisualizationStart,
      run: stepVisualizationView,
    },
  },
  taskFlows: {
    Simulation: 'hpccloud.taskflow.openfoam.tutorial.OpenFOAMTaskFlow',
    Visualization: 'hpccloud.taskflow.paraview.visualizer.ParaViewTaskFlow',
  },
  primaryJobs: {
    Simulation: 'openfoam_run',
    Visualization: 'paraview',
  },
  labels: {
    Introduction: {
      default: 'Introduction',
    },
    Input: {
      default: 'Dataset selection',
    },
    Simulation: {
      default: 'Simulation',
      run: 'Simulation (running)',
    },
    Visualization: {
      default: 'Visualization',
      run: 'Visualization (running)',
    },
  },
};
