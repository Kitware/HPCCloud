import girder from './GirderClient';

export function listProjects() {
    return girder.listProjects();
}

export function getProject(id) {
    return girder.getProject(id);
}

export function saveProject(project, attachements) {
    if(!project._id) {
        if(attachements) {
            return new Promise((resolve, reject) => {
                var projectResp;
                girder.createProject(project)
                    .then((resp) => {
                        // Upload file to folder
                        projectResp = resp;
                        return girder.createItem(resp.data.folderId, 'mesh', 'Mesh file used for simulation');
                    })
                    .then((resp) => {
                        //fill item with file
                        const itemId = resp.data._id,
                            params = {};
                        params.parentType = 'item';
                        params.parentId   = itemId;
                        params.name = 'mesh';
                        params.size = attachements.mesh.size;
                        console.log('Attach file to', itemId);
                        return girder.uploadFileToItem(params, attachements.mesh);
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

        return girder.createProject(project);
    }
    return girder.updateProject(project);
}

export function deleteProject(id) {
    // Caution this could fail if any simulation is nested !!!
    return girder.deleteProject(id);
}
