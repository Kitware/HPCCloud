import girder from './GirderClient';
import {invalidateSimulation} from './Notification';

export function deleteSimulation(id) {
    return girder.deleteSimulation(id);
}

export function getSimulation(id) {
    return girder.getSimulation(id);
}

function createSimulationPromise(simulation, name, file) {
    return new Promise((resolve, reject) => {
        var simulationResp;
        girder.createSimulation(simulation.projectId, simulation)
            .then((resp) => {
                // Upload file to folder
                simulationResp = resp;
                return girder.createItem(resp.data.folderId, name);
            })
            .then((resp) => {
                //fill item with file
                const itemId = resp.data._id,
                    params = {};
                params.parentType = 'item';
                params.parentId   = itemId;
                params.name = name;
                params.size = file.size;
                console.log('Attach file to', itemId);
                return girder.uploadFileToItem(params, file);
            })
            .then((resp) => {
                resolve(simulationResp);
            })
            .catch((error) => {
                const msg = error.data && error.data.message ? error.data.message : error.message;
                console.error('upload failed:' + msg);
                reject(error);
            });
    });
}

export function saveSimulation(simulation, attachments) {
    if(!simulation._id) {
        if (attachments) {
            const promises = [];
            for (const file in attachments) {
                promises.push(createSimulationPromise(simulation, file, attachments[file]));
            }
            return Promise.all(promises);
        }
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
