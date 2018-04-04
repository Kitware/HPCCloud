import girder from '../';
import { invalidateSimulation } from './notifications';
import { userHasAccess } from '../../utils/AccessHelper';

function createItemForSimulation(simulation, name, file) {
  return girder
    .createItem(simulation.metadata.inputFolder._id, name)
    .then((resp) => {
      // fill item with file
      const itemId = resp.data._id;
      const params = {};
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
      const msg =
        error.data && error.data.message ? error.data.message : error.message;
      console.error('upload failed:', msg);
    });
}

export function addFileForSimulationWithContents(
  simulation,
  itemName,
  fileName,
  contents
) {
  let fileId;
  return girder
    .createItem(simulation.metadata.inputFolder._id, itemName)
    .then((resp) => {
      const parentId = resp.data._id;
      return girder.newFile({
        parentType: 'item',
        parentId,
        name: fileName,
        size: 0,
      });
    })
    .then((resp) => {
      fileId = resp.data._id;
      const blob = new Blob([contents], { type: 'text/plain' });
      return girder
        .updateFileContent(resp.data._id, contents.length)
        .then((upload) => {
          girder.uploadChunk(fileId, 0, blob);
        });
    })
    .then((resp) => ({ _id: fileId }))
    .catch((err) => {
      console.log('Error adding ini content', err);
    });
}

export function addEmptyFileForSimulation(simulation, itemName, fileName) {
  return girder
    .createItem(simulation.metadata.inputFolder._id, itemName)
    .then((resp) => {
      const parentId = resp.data._id;
      return girder.newFile({
        parentType: 'item',
        parentId,
        name: fileName,
        size: 0,
      });
    });
}

// if there's not a sim.id, create a sim with two folders input and output
// otherwise update simulation
export function saveSimulation(simulation_, attachments) {
  let simulation = simulation_;
  if (!simulation._id) {
    let folder;
    let outputFolder;
    return (
      girder
        .createSimulation(simulation.projectId, simulation)
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
          simulation.metadata = Object.assign({}, simulation.metadata, {
            status: 'created',
            inputFolder: {
              _id: inputFolder,
              files: {},
            },
            outputFolder: {
              _id: outputFolder,
              files: {},
            },
          });
          return girder.editSimulation(simulation);
        })
        // upload files to inputfolder if there are any,
        // returns either promise result array with sim object as last item or simulation object.
        .then((resp) => {
          if (attachments) {
            const promises = [];
            Object.keys(attachments).forEach((file) => {
              promises.push(
                createItemForSimulation(simulation, file, attachments[file])
              );
            });
            return new Promise((a, r) => {
              Promise.all(promises).then(() => {
                a({ data: simulation });
              });
            });
          }
          return new Promise((a, r) => {
            a({ data: simulation });
          });
        })
        .catch(
          (error) =>
            new Promise((a, r) => {
              r(error);
            })
        )
    );
  }

  return girder.editSimulation(simulation);
}

export function activateSimulationStep(user, simulation, active, disabled) {
  // Update local data
  simulation.active = active;

  if (simulation.disabled.indexOf(active) !== -1) {
    simulation.disabled.splice(simulation.disabled.indexOf(active), 1);
  }

  if (disabled) {
    simulation.disabled.push(disabled);
  }
  invalidateSimulation(simulation);

  if (userHasAccess(user, simulation.access, 'WRITE')) {
    return girder.editSimulation(simulation);
  }

  return new Promise((res, rej) => {
    console.warn(
      'User does not have sufficient access to update step on server'
    );
    res();
  });
}
