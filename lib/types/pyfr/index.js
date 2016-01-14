import PyFrProject          from './NewProject';
import PyFrSimulation       from './ViewSimulation';
import PyFrInputDefinition  from './InputDefinition';

import PyFrIntroduction from './Introduction';
import PyFrLaunchViz    from './Visualizer/Launch';
import PyFrVisualizer   from './Visualizer/View';
import PyFrRun          from './Simulation';

export default {
    name: 'PyFr',
    components: {
        'NewProject': PyFrProject,
        'NewSimulation': null,
        'ViewSimulation': PyFrSimulation,
    },
    steps: {
        _order: [ 'Introduction', 'Simput', 'Simulation', 'Visualizer' ],
        Simput: {
            default: PyFrInputDefinition,
        },
        Introduction: {
            default: PyFrIntroduction,
        },
        Simulation: {
            default: PyFrRun,
        },
        Visualizer: {
            default: PyFrLaunchViz,
            launch: PyFrLaunchViz,
            viewer: PyFrVisualizer,
        },
    },
    menu: [
        {
            label: 'Introduction',
            link: '/View/Simulation/ID/Introduction',
        },{
            label: 'Pre-processing',
            children: [
                { link: '/View/Simulation/ID/Simput', label: 'Input definition'},
            ],
        },{
            label: 'Processing',
            children: [
                { link: '/View/Simulation/ID/Simulation', label: 'Run simulation'},
            ],
        },{
            label: 'Post-processing',
            children: [
                { link: '/View/Simulation/ID/Visualizer', label: '3D visualisation'},
            ],
        },
    ],
}
