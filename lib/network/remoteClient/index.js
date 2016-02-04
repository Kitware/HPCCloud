import {
    onBusy,
} from './BusyProgress';

import {
    getUserName,
    getUser,
    updateUser,
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
    saveAWSProfile,
    deleteAWSProfile,
    getAWSMaxInstances,
    listAWSProfiles,
    listAWSRunningInstances,
} from './AWS';

import {
    listProjects,
    getProject,
    saveProject,
    deleteProject,
} from './Project';

import {
    deleteSimulation,
    getProjectSimulations,
    getSimulation,
    saveSimulation,
    updateActiveStep,
} from './Simulation';

import {
    invalidateSimulation,
    onSimulationChange,
    invalidateProject,
    onProjectChange,
} from './Notification';

export default {
    onBusy,

    getUserName,
    getUser,
    updateUser,
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

    saveAWSProfile,
    deleteAWSProfile,
    getAWSMaxInstances,
    listAWSProfiles,
    listAWSRunningInstances,

    listProjects,
    getProject,
    saveProject,
    deleteProject,

    deleteSimulation,
    getProjectSimulations,
    getSimulation,
    saveSimulation,
    updateActiveStep,

    invalidateSimulation,
    onSimulationChange,
    invalidateProject,
    onProjectChange,
}
