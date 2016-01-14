export default {
    projects: {
        abc: {
            name: 'First project',
            id: 'abc',
            simulationIds: [ 'jlj'],
            type: 'PyFr',
        },
        def: {
            name: 'Second project',
            id: 'def',
            simulationIds: [],
            type: 'PyFr',
        },
        ghy: {
            name: 'Some project',
            id: 'ghy',
            simulationIds: ['lkj'],
            type: 'PyFr',
        },
        oiu: {
            name: 'Another project',
            id: 'oiu',
            simulationIds: ['yo'],
            type: 'PyFr',
        },
    },
    simulations: {
        lkj: {
            name: '2D couette',
            id: 'lkj',
            project: 'ghy',
        },
        jlj: {
            name: 'Surface tension',
            id: 'jlj',
            project: 'abc',
        },
        yo: {
            name: 'Unique sim',
            id: 'yo',
            project: 'oiu',
        },
    },
}
