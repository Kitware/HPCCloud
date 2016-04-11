import {
  saveAWSProfile,
  deleteAWSProfile,
  getAWSMaxInstances,
  listAWSProfiles,
  listAWSRunningInstances,
} from './AWS';

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
  onBusy,
  onProgress,
  onEvent,
} from './BusyProgress';

import {
  createCluster,
  deleteCluster,
  getCluster,
  getClusterLog,
  getClusterPresets,
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
} from './Folder';

import {
  deleteFile,
  downloadFile,
  editFile,
  getUploadOffset,
  newFile,
  updateFileContent,
  uploadChunk,
} from './File';

import {
  downloadItem,
  updateItemMetadata,
  listItems,
  createItem,
  listFiles,
  getItemRootPath,
  getItem,
  deleteItem,
  editItem,
  copyItem,
} from './Item';

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
  activateSimulationStep,
  addEmptyFileForSimulation,
  deleteSimulation,
  getProjectSimulations,
  getSimulation,
  getSimulationStep,
  saveSimulation,
  updateSimulationStep,
  updateDisabledSimulationSteps,
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
  getTaskflowLog,
  startTaskflow,
  getTaskflowStatus,
  getTaskflowTasks,
  createNewTaskForTaskflow,
  endTaskflow,
} from './Taskflows';

export default {
  /* Auth/User */
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

  /* AWS */
  saveAWSProfile,
  deleteAWSProfile,
  getAWSMaxInstances,
  listAWSProfiles,
  listAWSRunningInstances,

  /* BusyProgress */
  onBusy,
  onProgress,
  onEvent,

  /* Clusters */
  createCluster,
  deleteCluster,
  getCluster,
  getClusterLog,
  getClusterPresets,
  listClusterProfiles,
  saveCluster,
  testCluster,

  /* File */
  deleteFile,
  downloadFile,
  editFile,
  getUploadOffset,
  newFile,
  updateFileContent,
  uploadChunk,

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

  /* Item */
  downloadItem,
  updateItemMetadata,
  listItems,
  createItem,
  listFiles,
  getItemRootPath,
  getItem,
  deleteItem,
  editItem,
  copyItem,

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
  addEmptyFileForSimulation,
  deleteSimulation,
  getProjectSimulations,
  getSimulation,
  saveSimulation,
  activateSimulationStep,
  getSimulationStep,
  updateSimulationStep,
  updateDisabledSimulationSteps,

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
  getTaskflowLog,
  startTaskflow,
  getTaskflowStatus,
  getTaskflowTasks,
  createNewTaskForTaskflow,
  endTaskflow,
};
