import React from 'react';
import { connect } from 'react-redux';

import RuntimeBackend from '../../panels/RuntimeBackend';
import JobSubmission from '../../../../generic/components/steps/JobSubmission';

import getNetworkError from '../../../../../utils/getNetworkError';

// ----------------------------------------------------------------------------

const actionList = [
  { name: 'prepareJob', label: 'Start Simulation', icon: '' },
];

// ----------------------------------------------------------------------------

function clusterFilter(cluster) {
  return (
    'config' in cluster &&
    'pyfr' in cluster.config &&
    (('cuda' in cluster.config.pyfr && cluster.config.pyfr.cuda) ||
      ('opencl' in cluster.config.pyfr &&
        cluster.config.pyfr.opencl.length > 0) ||
      ('openmp' in cluster.config.pyfr &&
        cluster.config.pyfr.openmp.length > 0))
  );
}

// ----------------------------------------------------------------------------

function getPayload(props, state) {
  return {
    backend: state.backend,
    input: {
      folder: {
        id: props.simulation.metadata.inputFolder._id,
      },
      meshFile: {
        id: props.project.metadata.inputFolder.files.mesh,
      },
      iniFile: {
        id: props.simulation.metadata.inputFolder.files.ini,
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

function pyfrStart(props) {
  return (
    <JobSubmission
      addOn={RuntimeBackend}
      actionList={actionList}
      clusterFilter={clusterFilter}
      getPayload={getPayload}
      {...props}
    />
  );
}

// ----------------------------------------------------------------------------

export default connect((state) => ({
  error: getNetworkError(state, ['create_taskflow', 'start_taskflow']),
  clusters: state.preferences.clusters.mapById,
  volumes: state.preferences.volumes.mapById,
}))(pyfrStart);
