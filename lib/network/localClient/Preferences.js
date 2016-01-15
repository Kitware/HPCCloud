import cachedData           from './InitialCache';

export function getAWSProfiles(cb) {
    cb(cachedData.preferences.aws.profiles);
}

export function saveAWSProfile(profile, cb) {
    cachedData.preferences.aws.profiles.push(profile);
    cb();
}
