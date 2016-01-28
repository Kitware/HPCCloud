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
    createCluster,
    deleteCluster,
    listClusterProfiles,
    saveCluster,
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

    createCluster,
    deleteCluster,
    listClusterProfiles,
    saveCluster,

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
