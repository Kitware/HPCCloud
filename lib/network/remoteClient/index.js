import {
    getUserName,
    loggedIn,
    login,
    logout,
    onAuthChange,
    registerUser,
    changePassword,
} from './Auth';

import {
    listClusterProfiles,
    createCluster,
    deleteCluster,
} from './Cluster';

import {
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

    listClusterProfiles,
    createCluster,
    deleteCluster,

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
