import girder from './GirderClient';

export function listProjects() {
    return girder.listProjects();
}

export function getProject(id) {
    return girder.getProject(id);
}

function createProjectPromise(project, name, file) {
    return new Promise((resolve, reject) => {
        var projectResp;
        girder.createProject(project)
            .then((resp) => {
                // Upload file to folder
                projectResp = resp;
                return girder.createItem(resp.data.folderId, name);
            })
            .then((resp) => {
                //fill item with file
                const itemId = resp.data._id,
                    params = {};
                params.parentType = 'item';
                params.parentId   = itemId;
                params.name = file.name;
                params.size = file.size;
                console.log('Attach file to', itemId);
                return girder.uploadFileToItem(params, file);
            })
            .then((resp) => {
                resolve(projectResp);
            })
            .catch((error) => {
                const msg = error.data && error.data.message ? error.data.message : error.message;
                console.error('upload failed:' + msg);
                reject(error);
            });
    });
}

export function saveProject(project, attachements) {
    if(!project._id) {
        if(attachements) {
            const promises = [];
            for (const file in attachements) {
                promises.push(createProjectPromise(project, file, attachements[file]));
            }
            return Promise.all(promises);
        }
        return girder.createProject(project);
    }
    return girder.updateProject(project);
}

export function deleteProject(id) {
    // Caution this could fail if any simulation is nested !!!
    return girder.deleteProject(id);
}
