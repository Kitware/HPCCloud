import React                from 'react';
import { FileUploadEntry }  from '../../../../../panels/ItemEditor';

export default React.createClass({

  displayName: 'Project/New/NWChem NEB',

  propTypes: {
    owner: React.PropTypes.func,
  },

  render() {
    return (
      <div>
        <FileUploadEntry name="startGeometry" label="Starting Geometry file" accept=".xyz" owner={ this.props.owner } />
        <FileUploadEntry name="endGeometry" label="Final Geometry file" accept=".xyz" owner={ this.props.owner } />
      </div>);
  },
});
