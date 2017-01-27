import React                from 'react';
import { FileUploadEntry }  from '../../../../../panels/ItemEditor';

// ----------------------------------------------------------------------------

export default function newSimulation(props) {
  return (
    <div>
        <FileUploadEntry
          name="geometry"
          label="Geometry file"
          accept=".pdb,.xyz"
          owner={ props.owner }
        />
        <FileUploadEntry
          name="nw"
          label="nw file"
          accept=".nw"
          owner={ props.owner }
        />
    </div>);
}

// ----------------------------------------------------------------------------

newSimulation.propTypes = {
  owner: React.PropTypes.func,
};
