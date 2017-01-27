import React               from 'react';
import AttachedFileListing from './AttachedFileListing';

// ----------------------------------------------------------------------------

export default function editProjectWithFiles(props) {
  return <AttachedFileListing owner={props.owner} parentProps={props.parentProps} containerName="project" />;
}

// ----------------------------------------------------------------------------

editProjectWithFiles.propTypes = {
  owner: React.PropTypes.func,
  parentProps: React.PropTypes.object,
};
