import girder from './GirderClient';
import { invalidateSimulation } from './Notification';

export function deleteSimulation(id) {
  return girder.deleteSimulation(id);
}

export function getSimulation(id) {
  return girder.getSimulation(id);
}

function createItemForSimulation(simulation, name, file) {
  return girder.createItem(simulation.metadata.inputFolder._id, name)
    .then((resp) => {
      // fill item with file
      const itemId = resp.data._id,
        params = {};
      params.parentType = 'item';
      params.parentId = itemId;
      params.name = file.name;
      params.size = file.size;
      console.log('Attach file to', itemId);
      return girder.uploadFileToItem(params, file);
    })
    .then((resp) => {
      simulation.metadata.inputFolder.files[name] = resp.data._id;
      return girder.editSimulation(simulation);
    })
    .catch((error) => {
      const msg = error.data && error.data.message ? error.data.message : error.message;
      console.error('upload failed:', msg);
    });
}

export function addEmptyFileForSimulation(simulation, name) {
  return girder.createItem(simulation.metadata.inputFolder._id, name)
    .then(resp => {
      const parentId = resp.data._id;
      return girder.newFile({
        parentType: 'item',
        parentId,
        name,
        size: 0,
      });
    });
}

// if there's not a sim.id, create a sim with two folders input and output
// otherwise update simulation
export function saveSimulation(simulation, attachments) {
  if (!simulation._id) {
    let folder;
    let outputFolder;
    return girder.createSimulation(simulation.projectId, simulation)
      // make output folder
      .then((resp) => {
        simulation = resp.data;
        folder = {
          name: 'output',
          parentType: 'folder',
          parentId: resp.data.folderId,
        };
        return girder.createFolder(folder);
      })
      // make input folder
      .then((resp) => {
        outputFolder = resp.data._id;
        folder.name = 'input';
        return girder.createFolder(folder);
      })
      // update sim metadata
      .then((resp) => {
        const inputFolder = resp.data._id;
        simulation.metadata = {
          inputFolder: {
            _id: inputFolder,
            files: {},
          },
          outputFolder: {
            _id: outputFolder,
            files: {},
          },
        };
        return girder.editSimulation(simulation);
      })
      // upload files to inputfolder if there are any,
      // returns either promise result array with sim object as last item or simulation object.
      .then((resp) => {
        if (attachments) {
          const promises = [];
          for (const file in attachments) {
            promises.push(createItemForSimulation(simulation, file, attachments[file]));
          }
          promises.push(simulation);
          return Promise.all(promises);
        }
        return (simulation);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return girder.editSimulation(simulation);
}

export function getProjectSimulations(pId) {
  return girder.listSimulations(pId);
}

export function updateDisabledSimulationSteps(simulation) {
  invalidateSimulation(simulation);
  return girder.editSimulation(simulation);
}

export function activateSimulationStep(simulation, active, disabled) {
  // Update local data
  simulation.active = active;

  if (simulation.disabled.indexOf(active) !== -1) {
    simulation.disabled.splice(simulation.disabled.indexOf(active), 1);
  }

  if (disabled) {
    simulation.disabled.push(disabled);
  }
  invalidateSimulation(simulation);

  return girder.editSimulation(simulation);
}

export function getSimulationStep(id, name) {
  return girder.getSimulationStep(id, name);
}

export function updateSimulationStep(id, name, step) {
  return girder.updateSimulationStep(id, name, step);
}
