import React           from 'react';
import JobSubmission   from '../../../../../generic/components/steps/JobSubmission';

// ----------------------------------------------------------------------------

const actionList = [{ name: 'prepareJob', label: 'Start Simulation', icon: '' }];

// ----------------------------------------------------------------------------

function clusterFilter(cluster) {
  return 'config' in cluster
    && 'openfoam' in cluster.config
    && (cluster.config.openfoam && cluster.config.openfoam.enable);
}

// ----------------------------------------------------------------------------

function getPayload(props) {
  return {
    input: {
      folder: {
        id: props.simulation.metadata.inputFolder._id,
      },
      shFile: {
        id: props.simulation.metadata.inputFolder.files.sh,
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

export default (props) => (
  <JobSubmission
    {...props}

    actionList={actionList}
    clusterFilter={clusterFilter}
    getPayload={getPayload}
  />);
