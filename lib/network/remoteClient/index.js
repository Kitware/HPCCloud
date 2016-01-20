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
} from '../localClient/Preferences';

import {
    listProjects,
    getProject,
    saveProject,
    deleteProject,
} from '../localClient/Project';

import {
    getSimulation,
    saveSimulation,
    getProjectSimulations,
    deleteSimulation,
} from '../localClient/Simulation';

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
