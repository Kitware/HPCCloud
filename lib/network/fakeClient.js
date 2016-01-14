import values from 'mout/src/object/values';

const cachedData = {
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
    },
};

export function listProjects(cb) {
    cb(values(cachedData.projects));
}

export function getProject(id, cb) {
    cb(cachedData.projects[id]);
}

export function saveProject(project, cb) {
    if(!project.id) {
        project.id = Math.random().toString(36).substring(7);
    }
    cachedData.projects[project.id] = project;
    cb(project);
}

export function deleteSimulation(id, cb) {
    const simulation = cachedData.simulations[id];
    delete cachedData.simulations[id];
    cb(simulation);
}

export function deleteProject(id, cb) {
    const project = cachedData.projects[id];

    if(project && project.simulationIds) {
        project.simulationIds.forEach( simId => {
            deleteSimulation(simId, ()=>{} );
        })
    }

    delete cachedData.projects[id];
    cb(project);
}

export function getSimulation(id, cb) {
    cb(cachedData.simulations[id]);
}

export function saveSimulation(simulation, cb) {
    if(!simulation.id) {
        simulation.id = Math.random().toString(36).substring(7);
    }
    cachedData.simulations[simulation.id] = simulation;
    if(cachedData.projects[simulation.project].simulationIds.indexOf(simulation.id) === -1) {
        cachedData.projects[simulation.project].simulationIds.push(simulation.id);
    }
    cb(simulation);
}

export function getProjectSimulations(pId, cb) {
    var notReady = 0,
        simulationList = [];

    const getSimCallback = (sim) => {
        notReady--;
        if(sim) {
            simulationList.push(sim);
        }
        if(!notReady) {
            cb(simulationList);
        }
    };

    if(cachedData.projects[pId]) {
        const simulationIds = cachedData.projects[pId].simulationIds;
        notReady = simulationIds.length;
        simulationIds.forEach( id => {
            getSimulation(id, getSimCallback);
        });
    } else {
        cb([]);
    }
}

export function getAWSProfiles(cb) {
    cb(cachedData.preferences.aws.profiles);
}

export function saveAWSProfile(profile, cb) {
    cachedData.preferences.aws.profiles.push(profile);
    cb();
}

export default {
    listProjects,
    getProject,
    saveProject,
    getSimulation,
    saveSimulation,
    getProjectSimulations,
    deleteSimulation,
    deleteProject,
    getAWSProfiles,
}
