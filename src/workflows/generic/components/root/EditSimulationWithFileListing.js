import React               from 'react';
import AttachedFileListing from './AttachedFileListing';

// ----------------------------------------------------------------------------

export default function editSimulationWithFiles(props) {
  return <AttachedFileListing owner={props.owner} parentProps={props.parentProps} containerName="simulation" />;
}

// ----------------------------------------------------------------------------

editSimulationWithFiles.propTypes = {
  owner: React.PropTypes.func,
  parentProps: React.PropTypes.object,
};
