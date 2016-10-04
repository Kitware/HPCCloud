import React                from 'react';
import { FileUploadEntry }  from '../../../../panels/ItemEditor';

export default React.createClass({

  displayName: 'Simulation/New/PyFRExec',

  propTypes: {
    owner: React.PropTypes.func,
  },

  render() {
    return <FileUploadEntry name="ini" label="Ini file" accept=".ini" owner={ this.props.owner } />;
  },
});
