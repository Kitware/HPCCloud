import girder from 'js-girder-client/src/girder'; 

const stdCallback = (callback) => {
    return (error, success) => {
        if (error) {
            callback(JSON.parse(error.response).message, null);
        } else {
            callback(null, success);
        }
    };
}

export function changePassword(oldPassword, newPassword, callback) {
    girder.changePassword(oldPassword, newPassword, (error, success) => {
        if (error) {
            callback(JSON.parse(error.response).message, null);
        } else {
            callback(null, true);
        }
    });
}

//clusters
export function getClusterProfiles(callback) {
    girder.getClusterProfiles(stdCallback(callback));
}

export function getSingleClusterProfile(id, cb) {
    girder.getSingleClusterProfile(id, stdCallback(cb));
}

export function getClusterStatus(id, cb) {
    girder.getClusterStatus(id, stdCallback(cb));
}

export function getClusterLog(taskId, offset, cb) {
    girder.getClusterLog(taskId, offset, stdCallback(cb));
}

export function testCluster(id, cb) {
    girder.testCluster(id, stdCallback(cb));
}

export function createClusterProfile(prof, cb) {
    girder.createClusterProfile(prof, stdCallback(cb));
}

export function deleteClusterProfile(prof, cb) {
    girder.deleteClusterProfile(prof, stdCallback(cb));
}

//aws


//openstack