import {
    onBusy,
    onProgress,
    onEvent,
} from './BusyProgress';

import {
    changePassword,
    getLoggedInPromise,
    getUser,
    getUserName,
    loggedIn,
    login,
    logout,
    onAuthChange,
    registerUser,
    resetPassword,
    updateUser,
} from './Auth';

import {
    createCluster,
    deleteCluster,
    listClusterProfiles,
    saveCluster,
    testCluster,
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
    activateSimualtionStep,
} from './Simulation';

import {
    invalidateSimulation,
    onSimulationChange,
    invalidateProject,
    onProjectChange,
} from './Notification';

import {
    createTaskflow,
    getTaskflow,
    updateTaskflow,
    deleteTaskflow,
    startTaskflow,
    getTaskflowStatus,
    getTaskflowTaskStatuses,
    createNewTaskForTaskflow,
    endTaskflow,
} from './Taskflows'

export default {
    onBusy,
    onProgress,
    onEvent,

    changePassword,
    getLoggedInPromise,
    getUser,
    getUserName,
    loggedIn,
    login,
    logout,
    onAuthChange,
    registerUser,
    resetPassword,
    updateUser,

    createCluster,
    deleteCluster,
    listClusterProfiles,
    saveCluster,
    testCluster,

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
    activateSimualtionStep,

    invalidateSimulation,
    onSimulationChange,
    invalidateProject,
    onProjectChange,

    createTaskflow,
    getTaskflow,
    updateTaskflow,
    deleteTaskflow,
    startTaskflow,
    getTaskflowStatus,
    getTaskflowTaskStatuses,
    createNewTaskForTaskflow,
    endTaskflow,
}
