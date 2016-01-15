import {
    getAWSProfiles,
    saveAWSProfiles,
    getClusters,
    saveCluster,
} from './Preferences';

import {
    listProjects,
    getProject,
    saveProject,
    deleteProject,
} from './Project';

import {
    getSimulation,
    saveSimulation,
    getProjectSimulations,
    deleteSimulation,
} from './Simulation';

export default {
    listProjects,
    getProject,
    saveProject,
    getSimulation,
    saveSimulation,
    getProjectSimulations,
    deleteSimulation,
    deleteProject,
    getAWSProfiles,
    saveAWSProfiles,
    getClusters,
    saveCluster,
}
