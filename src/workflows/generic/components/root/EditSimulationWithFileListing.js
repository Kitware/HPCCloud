import React from 'react';
import PropTypes from 'prop-types';

import AttachedFileListing from './AttachedFileListing';

// ----------------------------------------------------------------------------

export default function editSimulationWithFiles(props) {
  return (
    <AttachedFileListing
      owner={props.owner}
      parentProps={props.parentProps}
      containerName="simulation"
    />
  );
}

// ----------------------------------------------------------------------------

editSimulationWithFiles.propTypes = {
  owner: PropTypes.func,
  parentProps: PropTypes.object,
};

editSimulationWithFiles.defaultProps = {
  owner: undefined,
  parentProps: undefined,
};
