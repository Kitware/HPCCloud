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
            status: 'preprocessing',
            name: '2D couette',
            id: 'lkj',
            project: 'ghy',
        },
        jlj: {
            status: 'processing',
            name: 'Surface tension',
            id: 'jlj',
            project: 'abc',
        },
        yo: {
            status: 'postprocessing',
            name: 'Unique sim',
            id: 'yo',
            project: 'oiu',
        },
    },
    preferences: {
        user: {

        },
        aws: {
            profiles: [
                {
                    name: 'My profile',
                    idKey: 'flhiu3hflukwjb3hfw8shnr1',
                    secretKey: 'keep it secret, keep it safe.',
                    region: 'sa-east-1',
                    availabilityZone: 'a',
                },
                {
                    name: 'Some other profile',
                    idKey: 'flhdadadadadaweweweweweqwqwqw',
                    secretKey: 'I have secrets that would make yours feel insufficient',
                    region: 'us-east-1',
                    availabilityZone: 'a',
                },
            ],
        },
        cluster: {
            clusters: [
                {
                    name: 'Some Cluster',
                    hostname: 'someserver.cern.org',
                    username: 'adminer',
                    slots: 2,
                    parallelEnv: 'open-mp',
                    paraviewDir: '/paraview',  
                },
                {
                    name: 'NSA Cluster',
                    hostname: 'myserver.nsa.gov',
                    username: 'sam',
                    slots: 2,
                    parallelEnv: 'open-ci',
                    paraviewDir: '/paraview',  
                },
            ],
        },
    },
};
