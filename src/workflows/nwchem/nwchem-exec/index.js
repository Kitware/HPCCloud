import rootNewSimulation  from './components/root/NewSimulation';
import rootViewSimulation from '../common/root/ViewSimulation';

import stepIntroduction       from '../common/steps/Introduction';
import stepSimulationStart    from '../common/steps/Simulation/Start';
import stepSimulationView     from '../common/steps/Simulation/View';
import stepVisualizationStart from '../common/steps/Visualization/Start';
import stepVisualizationView  from '../common/steps/Visualization/View';

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
    Simulation: 'hpccloud.taskflow.nwchem.NWChemTaskFlow',
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
