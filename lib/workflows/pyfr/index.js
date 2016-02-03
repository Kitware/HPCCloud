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
    menu: [
        {
            name: 'Introduction',
            label: 'Introduction',
            link: '/View/Simulation/ID/Introduction',
        },{
            name: 'Input',
            label: 'Input definition',
            link: '/View/Simulation/ID/Input',
        },{
            name: 'Simulation',
            label: 'Run simulation',
            link: '/View/Simulation/ID/Simulation',
        },{
            name: 'Visualizer',
            label: 'Post-processing',
            link: '/View/Simulation/ID/Visualizer',
        },
    ],
}
