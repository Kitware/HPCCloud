import rootNewProject         from './components/root/NewProject';
import rootViewSimulation     from '../common/root/ViewSimulation';

import stepInput              from './components/steps/Input';

import stepIntroduction       from '../common/steps/Introduction';
import stepSimulationStart    from '../common/steps/Simulation/Start';
import stepSimulationView     from '../common/steps/Simulation/View';
import stepVisualizationStart from '../common/steps/Visualization/Start';
import stepVisualizationView  from '../common/steps/Visualization/View';

export default {
  name: 'NWChem - Nudged Elastic Band (NEB) method',
  logo: require('./logo.png'),
  requiredAttachments: {
    project: ['startGeometry', 'endGeometry'],
    simulation: [],
  },
  components: {
    NewProject: rootNewProject,
    ViewSimulation: rootViewSimulation,
  },
  config: {},
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
    Simulation: 'hpccloud.taskflow.nwchem.neb.NWChemTaskFlow',
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
