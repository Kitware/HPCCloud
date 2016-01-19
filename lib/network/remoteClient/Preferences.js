import girder from 'js-girder-client/src/girder';

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


//aws


//openstack