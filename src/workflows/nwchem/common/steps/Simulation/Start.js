import React           from 'react';
import JobSubmission   from '../../../../generic/components/steps/JobSubmission';

// ----------------------------------------------------------------------------

const actionList = [{ name: 'prepareJob', label: 'Start Simulation', icon: '' }];

// ----------------------------------------------------------------------------

function clusterFilter(cluster) {
  return 'config' in cluster
    && 'nwchem' in cluster.config
    && (cluster.config.nwchem && cluster.config.nwchem.enable);
}

// ----------------------------------------------------------------------------

function getPayload(props) {
  const nwFile = props.simulation.metadata.inputFolder.files.nw || props.project.metadata.inputFolder.files.nw;

  return {
    input: {
      folder: {
        id: props.simulation.metadata.inputFolder._id,
      },
      project: {
        folder: {
          id: props.project.metadata.inputFolder._id,
        },
      },
      nwFile: {
        id: nwFile,
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

export default props => (
  <JobSubmission
    {...props}

    actionList={actionList}
    clusterFilter={clusterFilter}
    getPayload={getPayload}
  />);
