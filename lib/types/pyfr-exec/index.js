import PyFrNewSim       from './NewSimulation';
import PyFrSimulation   from './ViewSimulation';

import PyFrIntroduction from '../pyfr/Introduction';
import PyFrRun          from '../pyfr/Simulation';

export default {
    name: 'PyFr-Exec',
    logo: require('./logo.jpg'),
    components: {
        'NewProject': null,
        'NewSimulation': PyFrNewSim,
        'ViewSimulation': PyFrSimulation,
    },
    steps: {
        _order: [ 'Introduction', 'Simulation' ],
        Introduction: {
            default: PyFrIntroduction,
        },
        Simulation: {
            default: PyFrRun,
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
        },
    ],
}
