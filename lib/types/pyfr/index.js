import PyFrProject          from './NewProject';
import PyFrSimulation       from './ViewSimulation';
import PyFrInputDefinition  from './InputDefinition';

import PyFrIntroduction from './Introduction';
import PyFrLaunchViz    from './Visualizer/Launch';
import PyFrVisualizer   from './Visualizer/View';
import PyFrRun          from './Simulation';
import PyFrUpload       from './UploadIniFile';

export default {
    name: 'PyFr',
    components: {
        'NewProject': PyFrProject,
        'NewSimulation': null,
        'ViewSimulation': PyFrSimulation,
    },
    steps: {
        _order: {
            default: [ 'Introduction', 'Simput', 'Simulation', 'Visualizer' ],
            simput: [ 'Introduction', 'Simput', 'Simulation', 'Visualizer' ],
            quick: [ 'Introduction', 'Upload', 'Simulation', 'Visualizer' ],
        },
        Simput: {
            default: PyFrInputDefinition,
        },
        Upload: {
            default: PyFrUpload,
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
    menu: {
        simput: [
            {
                step: 'Introduction',
                label: 'Introduction',
                link: '/View/Simulation/ID/Introduction',
            },{
                label: 'Pre-processing',
                children: [
                    { link: '/View/Simulation/ID/Simput', label: 'Input definition', step: 'Simput'},
                ],
            },{
                label: 'Processing',
                children: [
                    { link: '/View/Simulation/ID/Simulation', label: 'Run simulation', step: 'Simulation'},
                ],
            },{
                label: 'Post-processing',
                children: [
                    { link: '/View/Simulation/ID/Visualizer', label: '3D visualisation', step: 'Visualizer'},
                ],
            },
        ],
        quick: [
            {
                step: 'Introduction',
                label: 'Introduction',
                link: '/View/Simulation/ID/Introduction',
            },{
                step: 'Upload',
                label: 'Upload',
                link: '/View/Simulation/ID/Upload',
            },{
                step: 'Simulation',
                label: 'Run',
                link: '/View/Simulation/ID/Simulation',
            },{
                step: 'Visualizer',
                label: 'Visualization',
                link: '/View/Simulation/ID/Visualizer',
            },
        ],
    },
}
