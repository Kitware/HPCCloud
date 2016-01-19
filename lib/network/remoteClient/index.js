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
} from './Preferences'

import {
    getAWSProfiles,
    saveAWSProfiles,
    getClusters,
    saveCluster,
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
