import {
    getUserName,
    loggedIn,
    login,
    logout,
    onAuthChange,
    registerUser,
} from './Auth';

import {
    changePassword,
    getAWSProfiles,
    saveAWSProfiles,
    getClusterProfiles,
    createClusterProfiles,
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

    changePassword,
    getAWSProfiles,
    saveAWSProfiles,
    getClusterProfiles,
    createClusterProfiles,

    listProjects,
    getProject,
    saveProject,
    deleteProject,

    getSimulation,
    saveSimulation,
    getProjectSimulations,
    deleteSimulation,
}
