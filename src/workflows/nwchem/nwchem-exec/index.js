import rootNewSimulation  from './components/root/NewSimulation';
import rootViewSimulation from '../../generic/components/root/ViewSimulation';

import stepIntroduction       from '../common/steps/Introduction';
import stepSimulationStart    from '../common/steps/Simulation/Start';
import stepSimulationView     from '../common/steps/Simulation/View';

export default {
  name: 'NWChem (Runtime)',
  logo: require('./logo.png'),
  requiredAttachments: {
    project: [],
    simulation: ['geometry', 'nw'],
  },
  components: {
    NewSimulation: rootNewSimulation,
    ViewSimulation: rootViewSimulation,
  },
  config: {},
  steps: {
    _order: ['Introduction', 'Simulation'],
    _disabled: [],
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
    Simulation: {
      default: 'Simulation',
      run: 'Simulation (running)',
    },
  },
};
