export default {
    name: 'Code Saturn',
    logo: require('./logo.png'),
    components: {
    },
    steps: {
        _order: [ 'Introduction' ],
        _initial_state: {
            Introduction: {
                type: 'input',
                metadata: {
                    alwaysAvailable: true,
                },
            },
        },
        Introduction: {
            default: null,
        },
    },
    labels: {
        Introduction: {
            default: 'Introduction',
        },
    },
}
