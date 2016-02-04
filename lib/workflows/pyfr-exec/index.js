import rootNewSimulation    from './components/root/NewSimulation';
import rootViewSimulation   from './components/root/ViewSimulation';

import stepIntroduction     from './components/steps/Introduction';
import stepSimulation       from './components/steps/Simulation';

// FIXME no Viz implementation yet
const stepStartViz   = null;
const stepVisualizer = null;

export default {
    name: 'PyFr-Exec',
    logo: require('./logo.jpg'),
    components: {
        'NewSimulation': rootNewSimulation,
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
        _order: [ 'Introduction', 'Simulation', 'Visualization' ],
        _initial_state: {
            Introduction: {
                type: 'input',
                metadata: {
                    active: true,
                    alwaysAvailable: true,
                },
            },
            Simulation: {
                type: 'output',
                metadata: {
                    disabled: false,
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
        Simulation: {
            default: stepSimulation,
        },
        Visualization: {
            default: stepStartViz,
            run: stepVisualizer,
        },
    },
    labels: {
        Introduction: {
            default: 'Introduction',
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
