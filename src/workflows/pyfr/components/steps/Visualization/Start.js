import React           from 'react';
import JobSubmission   from '../../../../generic/components/steps/JobSubmission';

// ----------------------------------------------------------------------------

const actionList = [{ name: 'prepareJob', label: 'Start Visualization', icon: '' }];

// ----------------------------------------------------------------------------

function clusterFilter(cluster) {
  return 'config' in cluster && 'paraview' in cluster.config &&
    'installDir' in cluster.config.paraview && cluster.config.paraview.installDir;
}

// ----------------------------------------------------------------------------

function getTaskflowMetaData(props) {
  const dataDir = props.simulation.steps.Visualization.metadata.dataDir;
  const fileName = props.simulation.steps.Visualization.metadata.fileName;

  return {
    dataDir,
    fileName,
    sessionId: props.simulation.steps.Visualization.folderId,
  };
}

// ----------------------------------------------------------------------------

function getPayload(props) {
  const sessionKey = props.simulation.steps.Visualization.folderId;
  const dataDir = props.simulation.steps.Visualization.metadata.dataDir;
  const fileName = props.simulation.steps.Visualization.metadata.fileName;

  return {
    dataDir, // where the output for the sim will be
    fileName, // the file to load
    sessionKey, // for pvw, we use this later for connecting,
    output: {
      folder: {
        id: props.simulation.steps.Visualization.folderId,
      },
    },
  };
}

// ----------------------------------------------------------------------------

export default function openFoamStart(props) {
  return (
    <JobSubmission
      {...props}

      actionList={actionList}
      clusterFilter={clusterFilter}
      getTaskflowMetaData={getTaskflowMetaData}
      getPayload={getPayload}
    />);
}
