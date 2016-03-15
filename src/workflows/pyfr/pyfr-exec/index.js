import rootNewSimulation  from './components/root/NewSimulation';
import rootViewSimulation from './components/root/ViewSimulation';

import stepIntroduction       from '../common/steps/Introduction';
import stepSimulationStart    from '../common/steps/Simulation/Start';
import stepSimulationView     from '../common/steps/Simulation/View';
import stepVisualizationStart from '../common/steps/Visualization/Start';
import stepVisualizationView  from '../common/steps/Visualization/View';

export default {
  name: 'PyFr (Runtime)',
  logo: require('./logo.jpg'),
  components: {
    NewSimulation: rootNewSimulation,
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
      default: stepSimulationStart,
      run: stepSimulationView,
    },
    Visualization: {
      default: stepVisualizationStart,
      run: stepVisualizationView,
    },
  },
  taskFlows: {
    Simulation: 'hpccloud.taskflow.pyfr.PyFrTaskFlow',
    Visualization: 'hpccloud.taskflow.paraview.ParaViewTaskFlow',
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
      run: 'Visualization (running)',
    },
  },
};
