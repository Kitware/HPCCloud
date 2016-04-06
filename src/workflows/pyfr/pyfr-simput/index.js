import rootNewProject         from './components/root/NewProject';
import rootViewSimulation     from '../common/root/ViewSimulation';

import stepInput              from './components/steps/Input';

import stepIntroduction       from '../common/steps/Introduction';
import stepSimulationStart    from '../common/steps/Simulation/Start';
import stepSimulationView     from '../common/steps/Simulation/View';
import stepVisualizationStart from '../common/steps/Visualization/Start';
import stepVisualizationView  from '../common/steps/Visualization/View';

export default {
  name: 'PyFR',
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
        description: 'Check if the cluster is able to run Cuda for PyFR',
      },
      'config.pyfr.opencl': {
        type: 'profile',
        label: 'OpenCL configurations',
        description: 'Set of options that can be used with the OpenCL backend for PyFR',
        profile: {
          'platform-id': {
            type: 'text',
            label: 'Platform ID',
            description: 'OpenCL backend for PyFR: platform-id',
          },
          'device-type': {
            type: 'enum',
            label: 'Device type',
            values: ['all', 'cpu', 'gpu', 'accelerator'],
            description: 'OpenCL backend for PyFR: platform-id',
          },
          'device-id': {
            type: 'text',
            label: 'Device ID',
            description: 'OpenCL backend for PyFR: device-id',
          },
        },
      },
      'config.pyfr.openmp': {
        type: 'profile',
        label: 'OpenMP configurations',
        description: 'Set of options that can be used with the OpenMP backend for PyFR',
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
    _order: ['Introduction', 'Input', 'Simulation', 'Visualization'],
    _disabled: ['Simulation', 'Visualization'],
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
    Simulation: 'hpccloud.taskflow.pyfr.PyFrTaskFlow',
    Visualization: 'hpccloud.taskflow.paraview.ParaViewTaskFlow',
  },
  primaryJobs: {
    Simulation: 'pyfr_run',
    Visualization: 'paraview',
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
      run: 'Simulation (running)',
    },
    Visualization: {
      default: 'Visualization',
      run: 'Visualization (running)',
    },
  },
};
