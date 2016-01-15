import {
    getUserName,
    loggedIn,
    login,
    logout,
    onAuthChange,
    registerUser,
} from './Auth';

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
    getUserName,
    loggedIn,
    login,
    logout,
    onAuthChange,
    registerUser,

    getAWSProfiles,
    saveAWSProfiles,
    getClusters,
    saveCluster,

    listProjects,
    getProject,
    saveProject,
    deleteProject,

    getSimulation,
    saveSimulation,
    getProjectSimulations,
    deleteSimulation,
}
