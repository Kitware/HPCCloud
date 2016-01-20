import cachedData from './InitialCache';

export function getAWSProfiles(cb) {
    cb(cachedData.preferences.aws.profiles);
}

export function saveAWSProfile(profile, cb) {
    var found = false;
    for (let i=0; i < cachedData.preferences.aws.profiles.length; i++) {
        if (cachedData.preferences.aws.profiles[i].name === profile.name) {
            cachedData.preferences.aws.profiles[i] = profile;
            found = true;
            break;
        }
    }

    if (found === false) {
        cachedData.preferences.aws.profiles.push(profile);
    }

    cb();
}

export function getClusterProfiles(cb) {
    cb(cachedData.preferences.cluster.clusters);
}

export function createCluster() {
    console.log('cluster saved');
}
