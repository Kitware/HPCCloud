import React from 'react';
import PropTypes from 'prop-types';

import { FileUploadEntry } from '../../../../../panels/ItemEditor';

// ----------------------------------------------------------------------------

export default function newSimulation(props) {
  return (
    <div>
      <FileUploadEntry
        name="geometry"
        label="Geometry file"
        accept=".pdb,.xyz"
        owner={props.owner}
      />
      <FileUploadEntry
        name="nw"
        label="nw file"
        accept=".nw"
        owner={props.owner}
      />
    </div>
  );
}

// ----------------------------------------------------------------------------

newSimulation.propTypes = {
  owner: PropTypes.func,
};

newSimulation.defaultProps = {
  owner: undefined,
};
