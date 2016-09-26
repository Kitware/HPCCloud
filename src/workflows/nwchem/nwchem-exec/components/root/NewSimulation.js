import React                from 'react';
import { FileUploadEntry }  from '../../../../../panels/ItemEditor';

export default React.createClass({

  displayName: 'Simulation/New/NWChemExec',

  propTypes: {
    owner: React.PropTypes.func,
  },

  render() {
    return (
      <div>
        <FileUploadEntry name="geometry" label="Geometry file" accept=".pdb,.xyz" owner={ this.props.owner } />
        <FileUploadEntry name="nw" label="nw file" accept=".nw" owner={ this.props.owner } />
      </div>);
  },
});
