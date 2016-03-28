import girder from './GirderClient';

export function listProjects() {
  return girder.listProjects();
}

export function getProject(id) {
  return girder.getProject(id);
}

function createItemForProject(project, name, file) {
  return girder.createItem(project.metadata.inputFolder._id, name)
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
      project.metadata.inputFolder.files[name] = resp.data._id;
      return girder.updateProject(project);
    })
    .catch((error) => {
      const msg = error.data && error.data.message ? error.data.message : error.message;
      console.error('upload failed:', msg);
    });
}

export function saveProject(project_, attachments) {
  var project = project_;
  if (!project._id) {
    let folder;
    let outputFolder;
    return girder.createProject(project)
      // make output folder
      .then((resp) => {
        project = resp.data;
        folder = {
          name: 'output',
          parentType: 'folder',
          parentId: project.folderId,
        };
        return girder.createFolder(folder);
      })
      // make input folder
      .then((resp) => {
        outputFolder = resp.data._id;
        folder.name = 'input';
        return girder.createFolder(folder);
      })
      // update proj metadata
      .then((resp) => {
        const inputFolder = resp.data._id;
        project.metadata = {
          inputFolder: {
            _id: inputFolder,
            files: {},
          },
          outputFolder: {
            _id: outputFolder,
            files: {},
          },
        };
        return girder.updateProject(project);
      })
      // upload files to inputfolder if there are any,
      // returns either promise result array with sim object as last item or simulation object.
      .then((resp) => {
        if (attachments) {
          const promises = [];
          Object.keys(attachments).forEach(file => {
            promises.push(createItemForProject(project, file, attachments[file]));
          });
          promises.push(new Promise((a, r) => { a({ data: project }); }));
          return Promise.all(promises);
        }
        return new Promise((a, r) => { a({ data: project }); });
      })
      .catch((error) => new Promise((a, r) => { r(error); }));
  }
  return girder.updateProject(project);
}

export function deleteProject(id) {
  // Caution this could fail if any simulation is nested !!!
  return girder.deleteProject(id);
}
