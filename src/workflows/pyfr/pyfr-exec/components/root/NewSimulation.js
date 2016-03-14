import React                from 'react';
import { FileUploadEntry }  from '../../../../../panels/ItemEditor';

export default React.createClass({

  displayName: 'Simulation/New/PyFrExec',

  propTypes: {
    owner: React.PropTypes.func,
  },

  render() {
    return (
      <div>
        <FileUploadEntry name="mesh" label="Mesh file (.msh)" accept=".msh" owner={ this.props.owner } />
        <FileUploadEntry name="ini" label="Ini file (.ini)" accept=".ini" owner={ this.props.owner } />
      </div>);
  },
});
