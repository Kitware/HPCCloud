import rootViewSimulation from '../../generic/components/root/ViewSimulation';
import rootEditProject from '../../generic/components/root/EditProjectWithFileListing';
import rootNewProject from './components/root/NewProject';

import stepIntroduction from './components/steps/Introduction';
import stepGeometry from './components/steps/Geometry';
import stepInput from './components/steps/Input';
import stepSimulationStart from './components/steps/Simulation/Start';
import stepSimulationView from './components/steps/Simulation/View';
import stepVisualizationStart from './components/steps/Visualization/Start';
import stepVisualizationView from './components/steps/Visualization/View';

export default {
  name: 'OpenFoam - Wind Tunnel',
  logo: require('./logo.png'),
  requiredAttachments: {
    project: ['mesh'],
    simulation: [],
  },
  components: {
    NewProject: rootNewProject,
    EditProject: rootEditProject,
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
    _order: [
      'Introduction',
      'Geometry',
      'Input',
      'Simulation',
      'Visualization',
    ],
    _disabled: ['Visualization'],
    _initial_state: {
      Introduction: {
        type: 'input',
        metadata: {
          alwaysAvailable: true,
        },
      },
      Geometry: {
        type: 'input',
        metadata: {},
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
    Geometry: {
      default: stepGeometry,
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
    Simulation: 'hpccloud.taskflow.openfoam.windtunnel.OpenFOAMTaskFlow',
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
    Geometry: {
      default: 'Wind tunnel',
    },
    Input: {
      default: 'Advance settings',
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
