import rootNewProject         from './components/root/NewProject';
import rootViewSimulation     from '../../generic/components/root/ViewSimulation';

import stepIntroduction       from '../common/steps/Introduction';
import stepInput              from './components/steps/Input';
import stepSimulationStart    from '../common/steps/Simulation/Start';
import stepSimulationView     from '../common/steps/Simulation/View';

export default {
  name: 'NWChem',
  logo: require('./logo.png'),
  requiredAttachments: {
    project: ['geometry'],
    simulation: [],
  },
  components: {
    NewProject: rootNewProject,
    ViewSimulation: rootViewSimulation,
  },
  config: {
    cluster: {
      'config.nwchem.enable': {
        type: 'bool',
        label: 'NWChem enabled',
        description: 'Check if the cluster is able to run NWChem simulation',
      },
    },
  },
  steps: {
    _order: ['Introduction', 'Input', 'Simulation'],
    _disabled: ['Simulation'],
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
  },
  taskFlows: {
    Simulation: 'hpccloud.taskflow.nwchem.NWChemTaskFlow',
  },
  primaryJobs: {
    Simulation: 'pyfr_run',
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
  },
};
