import React from 'react';
import PropTypes from 'prop-types';

import AttachedFileListing from './AttachedFileListing';

// ----------------------------------------------------------------------------

export default function editProjectWithFiles(props) {
  return (
    <AttachedFileListing
      owner={props.owner}
      parentProps={props.parentProps}
      containerName="project"
    />
  );
}

// ----------------------------------------------------------------------------

editProjectWithFiles.propTypes = {
  owner: PropTypes.func,
  parentProps: PropTypes.object,
};

editProjectWithFiles.defaultProps = {
  owner: undefined,
  parentProps: undefined,
};
