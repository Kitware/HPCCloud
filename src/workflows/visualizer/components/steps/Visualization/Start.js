import React from 'react';
import JobSubmission from '../../../../generic/components/steps/JobSubmission';

// ----------------------------------------------------------------------------

const actionList = [
  { name: 'prepareJob', label: 'Start Visualization', icon: '' },
];

// ----------------------------------------------------------------------------

function clusterFilter(cluster) {
  return (
    'config' in cluster &&
    'paraview' in cluster.config &&
    'installDir' in cluster.config.paraview &&
    cluster.config.paraview.installDir
  );
}

// ----------------------------------------------------------------------------

function getTaskflowMetaData(props) {
  console.log('getTaskflowMetaData', props);
  return {
    sessionId: props.simulation._id,
  };
}

// ----------------------------------------------------------------------------

function getPayload(props) {
  console.log('getPayload', props);
  const sessionKey = props.simulation._id;

  return {
    sessionKey, // for pvw, we use this later for connecting,
    input: {
      file: {
        id: props.simulation.metadata.inputFolder.files.dataset,
      },
    },
    output: {
      folder: {
        id: props.simulation.metadata.outputFolder._id,
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
    />
  );
}
