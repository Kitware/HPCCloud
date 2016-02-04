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
        'NewProject': rootNewProject,
        'ViewSimulation': rootViewSimulation,
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
        _order: [ 'Introduction', 'Input', 'Simulation', 'Visualizer' ],
        _initial_state: {
            Introduction: {
                type: 'input',
                metadata: {
                    active: true,
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
            Visualization: {
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
        Visualization: {
            default: 'Visualization',
            run: 'Visualization (running)',
        },
    },
}
