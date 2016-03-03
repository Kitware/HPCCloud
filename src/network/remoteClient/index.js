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
    listFolders,
    createFolder,
    editFolderMetaData,
    deleteFolder,
    getFolder,
    editFolder,
    downloadFolder,
    getFolderAccess,
    editFolderAccess,
} from './Folder'

import {
    getUploadOffset,
    downloadFile,
    updateFileContent,
    deleteFile,
    editFile,
    newFile,
} from './File'

import {
    saveAWSProfile,
    deleteAWSProfile,
    getAWSMaxInstances,
    listAWSProfiles,
    listAWSRunningInstances,
} from './AWS';

import {
    getJobs,
    createJob,
    getJob,
    updateJob,
    deleteJob,
    getJobLog,
    getJobOutput,
    getJobStatus,
    terminateJob,
} from './Jobs';

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
    activateSimulationStep,
    getSimulationStep,
    updateSimulationStep,
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
    getTaskflowTasks,
    createNewTaskForTaskflow,
    endTaskflow,
} from './Taskflows'

export default {
    /* BusyProgress */
    onBusy,
    onProgress,
    onEvent,

    /* User */
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

    /* Clusters */
    createCluster,
    deleteCluster,
    listClusterProfiles,
    saveCluster,
    testCluster,

    /* File */
    getUploadOffset,
    downloadFile,
    updateFileContent,
    deleteFile,
    editFile,
    newFile,

    /* Folder */
    listFolders,
    createFolder,
    editFolderMetaData,
    deleteFolder,
    getFolder,
    editFolder,
    downloadFolder,
    getFolderAccess,
    editFolderAccess,

    /* AWS */
    saveAWSProfile,
    deleteAWSProfile,
    getAWSMaxInstances,
    listAWSProfiles,
    listAWSRunningInstances,

    /* Jobs */
    getJobs,
    createJob,
    getJob,
    updateJob,
    deleteJob,
    getJobLog,
    getJobOutput,
    getJobStatus,
    terminateJob,

    /* Project */
    listProjects,
    getProject,
    saveProject,
    deleteProject,

    /* Simulation */
    deleteSimulation,
    getProjectSimulations,
    getSimulation,
    saveSimulation,
    activateSimulationStep,
    getSimulationStep,
    updateSimulationStep,

    /* Notifications */
    invalidateSimulation,
    onSimulationChange,
    invalidateProject,
    onProjectChange,

    /* Taskflow */
    createTaskflow,
    getTaskflow,
    updateTaskflow,
    deleteTaskflow,
    startTaskflow,
    getTaskflowStatus,
    getTaskflowTasks,
    createNewTaskForTaskflow,
    endTaskflow,
}
