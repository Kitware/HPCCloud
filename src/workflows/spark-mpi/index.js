import rootNewProject         from './components/root/NewProject';
import rootNewSimulation      from './components/root/NewSimulation';
import rootViewSimulation   from '../generic/components/root/ViewSimulation';

import stepIntroduction     from './components/steps/Introduction';
import stepStartViz         from './components/steps/Visualization/Start';
import stepVisualizer       from './components/steps/Visualization/View';

export default {
  name: 'Spark-MPI',
  logo: require('./logo.png'),
  requiredAttachments: {
    project: ['startScript', 'sparkScript', 'input'],
    simulation: [],
  },
  components: {
    NewProject: rootNewProject,
    NewSimulation: rootNewSimulation,
    ViewSimulation: rootViewSimulation,
  },
  config: {
    cluster: {
      'config.sparkmpi.sparkPath': {
        type: 'text',
        label: 'Spark-MPI Directory',
        description: 'Path to the SparkMPI directory.',
      },
    },
  },
  steps: {
    _order: ['Introduction', 'Visualization'],
    _initial_state: {
      Introduction: {
        type: 'information',
        metadata: {
          alwaysAvailable: true,
        },
      },
      Visualization: {
        type: 'output',
        metadata: {
          disabled: false,
        },
      },
    },
    Introduction: {
      default: stepIntroduction,
    },
    Visualization: {
      default: stepStartViz,
      run: stepVisualizer,
    },
  },
  taskFlows: {
    Visualization: 'hpccloud.taskflow.paraview.visualizer.ParaViewTaskFlow',
  },
  primaryJobs: {
    Visualization: 'paraview',
  },
  labels: {
    Introduction: {
      default: 'Introduction',
    },
    Visualization: {
      default: 'Visualization',
      run: 'Visualization (running)',
    },
  },
};
