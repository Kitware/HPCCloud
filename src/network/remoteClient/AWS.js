import girder from './GirderClient';

export function listAWSProfiles() {
  return girder.listAWSProfiles();
}

export function saveAWSProfile(profile) {
  if (profile._id) {
    return girder.updateAWSProfile(profile);
  }
  return girder.createAWSProfile(profile);
}

export function listAWSRunningInstances(id) {
  return girder.listAWSRunningInstances(id);
}

export function getAWSMaxInstances(id) {
  return girder.getAWSMaxInstances(id);
}


export function deleteAWSProfile(id) {
  return girder.deleteAWSProfile(id);
}
