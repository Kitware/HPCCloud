import cachedData from './InitialCache';

export function deleteSimulation(id, cb) {
    const simulation = cachedData.simulations[id];
    delete cachedData.simulations[id];
    cb(simulation);
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
