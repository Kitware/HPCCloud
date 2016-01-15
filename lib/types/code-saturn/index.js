export default {
    name: 'Code Saturn',
    components: {
        'NewProject': null,
        'NewSimulation': null,
        'ViewSimualtion': null,
    },
    steps: {
        _order: [ 'Introduction' ],
        Introduction: {
            default: null,
        },
    },
    menu: [
        {
            label: 'Introduction',
            link: '/View/Simulation/ID/Introduction',
        },
    ],
}
