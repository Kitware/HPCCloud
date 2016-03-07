import rootNewSimulation from './components/root/NewSimulation';
import rootViewSimulation from './components/root/ViewSimulation';

import stepIntroduction from './components/steps/Introduction';
import stepStartSim from './components/steps/Simulation/Start';
import stepViewSim from './components/steps/Simulation/View';

const stepStartViz = null;

export default {
  name: 'PyFr-Exec',
  logo: require('./logo.jpg'),
  components: {
    NewSimulation: rootNewSimulation,
    ViewSimulation: rootViewSimulation,
  },
  config: {
    cluster: {
      'config.paraview.installDir': {
        label: 'ParaView Directory',
        description: 'Path to the home directory of ParaView.',
      },
      'config.pyfr.lapack': {
        label: 'Lapack library',
        description: 'Path to the lapack library for the PyFr execution.',
      },
    },
  },
  steps: {
    _order: ['Introduction', 'Simulation', 'Visualization'],
    _disabled: ['Visualization'],
    _active: 'Introduction',
    _initial_state: {
      Introduction: {
        type: 'information',
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
    Simulation: {
      default: stepStartSim,
      run: stepViewSim,
    },
    Visualization: {
      default: stepStartViz,
    },
  },
  taskFlows: {
    Simulation: 'hpccloud.taskflow.pyfr.PyFrTaskFlow',
  },
  labels: {
    Introduction: {
      default: 'Introduction',
    },
    Simulation: {
      default: 'Simulation',
      run: 'Simulation (running)',
    },
    Visualization: {
      default: 'Visualization',
    },
  },
};
