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
    menu: [
        {
            name: 'Introduction',
            label: 'Introduction',
            link: '/View/Simulation/ID/Introduction',
        },{
            name: 'Simulation',
            label: 'Run',
            link: '/View/Simulation/ID/Simulation',
        },{
            name: 'Visualization',
            label: 'Visualization',
            link: '/View/Simulation/ID/Simulation',
        },
    ],
}
