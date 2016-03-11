import rootNewProject       from './components/root/NewProject';
import rootViewSimulation   from './components/root/ViewSimulation';

import stepIntroduction     from './components/steps/Introduction';
import stepInput            from './components/steps/Input';
import stepSimulation       from './components/steps/Simulation';

// FIXME no Viz implementation yet
const stepStartViz   = null;
const stepVisualizer = null;

export default {
  name: 'PyFr',
  logo: require('./logo.jpg'),
  components: {
    NewProject: rootNewProject,
    ViewSimulation: rootViewSimulation,
  },
  config: {
    cluster: {
      'config.paraview.installDir': {
        type: 'text',
        label: 'ParaView Directory',
        description: 'Path to the home directory of ParaView.',
      },
      'config.pyfr.cuda': {
        type: 'bool',
        label: 'Cuda enabled',
        description: 'Check if the cluster is able to run Cuda for PyFr',
      },
      'config.pyfr.opencl': {
        type: 'profile',
        label: 'OpenCL configurations',
        description: 'Set of options that can be used with the OpenCL backend for PyFr',
        profile: {
          'platform-id': {
            type: 'text',
            label: 'Platform ID',
            description: 'OpenCL backend for PyFr: platform-id',
          },
          'device-type': {
            type: 'enum',
            label: 'Device type',
            values: ['all', 'cpu', 'gpu', 'accelerator'],
            description: 'OpenCL backend for PyFr: platform-id',
          },
          'device-id': {
            type: 'text',
            label: 'Device ID',
            description: 'OpenCL backend for PyFr: device-id',
          },
        },
      },
      'config.pyfr.openmp': {
        type: 'profile',
        label: 'OpenMP configurations',
        description: 'Set of options that can be used with the OpenMP backend for PyFr',
        profile: {
          cc: {
            type: 'text',
            label: 'Compiler',
            description: 'C Compiler',
          },
          cflags: {
            type: 'text',
            label: 'Flags',
            description: 'Additional C compiler flags',
          },
          cblas: {
            type: 'text',
            label: 'BLAS library',
            description: 'Path to shared C BLAS library',
          },
          'cblas-type': {
            type: 'text',
            label: 'BLAS Type',
            description: 'Type of BLAS library',
          },
        },
      },
    },
  },
  steps: {
    _order: ['Introduction', 'Input', 'Simulation', 'Visualizer'],
    _initial_state: {
      Introduction: {
        type: 'input',
        metadata: {
          alwaysAvailable: true,
        },
      },
      Input: {
        type: 'input',
        metadata: {
          disabled: false,
        },
      },
      Simulation: {
        type: 'output',
        metadata: {
          disabled: true,
        },
      },
      Visualizer: {
        type: 'output',
        metadata: {
          disabled: true,
        },
      },
    },
    Introduction: {
      default: stepIntroduction,
    },
    Input: {
      default: stepInput,
    },
    Simulation: {
      default: stepSimulation,
    },
    Visualizer: {
      default: stepStartViz,
      viewer: stepVisualizer,
    },
  },
  labels: {
    Introduction: {
      default: 'Introduction',
    },
    Input: {
      default: 'Input definition',
    },
    Simulation: {
      default: 'Simulation',
    },
    Visualizer: {
      default: 'Visualization',
      run: 'Visualization (running)',
    },
  },
};
