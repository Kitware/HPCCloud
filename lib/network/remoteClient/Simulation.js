import girder from './GirderClient';

export function deleteSimulation(id) {
    return girder.deleteSimulation(id);
}

export function getSimulation(id) {
    return girder.getSimulation(id);
}

export function saveSimulation(simulation) {
    if(!simulation._id) {
        return girder.createSimulation(simulation.projectId, simulation);
    }

    return girder.editSimulation(simulation);
}

export function getProjectSimulations(pId) {
    return girder.listSimulations(pId);
}
