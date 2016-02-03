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
                girder.createProject(project)
                    .then(resp => {
                        // Upload file to folder
                        const folderId = resp.data.folderId;
                        console.log('Attach file to', folderId);
                        resolve(resp);
                    })
                    .catch( resp => {
                        reject(resp);
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
