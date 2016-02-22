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

export function activateSimulationStep(simulation, active, disabled) {
    // Update local data
    simulation.active = active;
    if(disabled) {
        simulation.disabled = disabled;
    }
    invalidateSimulation(simulation);

    return girder.editSimulation({_id: simulation._id, active, disabled});
}

export function getSimulationStep(id, name) {
    return girder.getSimulationStep(id, name);
}

export function updateSimulationStep(id, name, step) {
    return girder.updateSimulationStep(id, name, step);
}
