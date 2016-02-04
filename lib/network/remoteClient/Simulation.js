import girder from './GirderClient';
import {invalidateSimulation} from './Notification';

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

export function activateSimualtionStep(simulation, step) {
    // Update local data
    simulation.active = step;
    invalidateSimulation(simulation);

    return girder.activateSimulationStep(simulation._id, step);
    // var promises = [];

    // // Desactivate all active
    // for(const name in simulation.steps) {
    //     if(simulation.steps[name].metadata.active) {
    //         const metadata = simulation.steps[name].metadata;
    //         metadata.active = false;
    //         if(stepToDisable && stepToDisable === name) {
    //             metadata.disabled = true;
    //         }
    //         promises.push(girder.updateSimulationStep(simulation._id, name, metadata));
    //     }
    // }

    // // Unable the active one
    // const metadata = simulation.steps[step].metadata;
    // metadata.active = true;
    // metadata.disabled = false;
    // promises.push(girder.updateSimulationStep(simulation._id, step, metadata));

    // // Update local data
    // invalidateSimulation(simulation);

    // return Promise.all(promises);
}

export function disableSimulationStep(simulation, step) {
    const metadata = simulation.steps[step].metadata;
    metadata.disabled = true;
    invalidateSimulation(simulation);
    return girder.updateSimulationStep(simulation._id, step, metadata)
}

export function enableSimulationStep(simulation, step) {
    const metadata = simulation.steps[step].metadata;
    metadata.disabled = false;
    invalidateSimulation(simulation);
    return girder.updateSimulationStep(simulation._id, step, metadata)
}
