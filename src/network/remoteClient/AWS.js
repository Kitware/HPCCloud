import girder from './GirderClient';
import { getJSON } from './Utils';

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

export function getEC2InstanceTypes() {
  return getJSON('/ec2_instance_types.json');
}
