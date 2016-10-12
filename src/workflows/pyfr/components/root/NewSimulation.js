/* global Simput */
import React                from 'react';
import { FileUploadEntry }  from '../../../../panels/ItemEditor';

import { connect }  from 'react-redux';
import { dispatch } from '../../../../redux';
import * as NetActions from '../../../../redux/actions/network';

const NewSimulation = React.createClass({

  displayName: 'Simulation/New/PyFR',

  propTypes: {
    owner: React.PropTypes.func,
    onParseError: React.PropTypes.func,
  },

  parseAndValidate(file) {
    return new Promise((accept, reject) => {
      var reader = new FileReader();
      reader.onloadend = () => {
        if (reader.readyState !== FileReader.DONE) {
          this.props.onParseError('Ini file is invalid');
          reject();
        }
        try {
          Simput.types.pyfr.parse('pyfr', reader.result);
        } catch (e) {
          this.props.onParseError(`Error parsing file:\n${e}`);
          this.props.owner().removeMetadata('ini');
          reject();
        }
        accept({});
      };

      reader.readAsText(file);
    });
  },

  render() {
    return (<div>
      <FileUploadEntry name="ini" label="Ini file*" accept=".ini" owner={ this.props.owner } postProcess={ this.parseAndValidate } />
      <small style={{ marginLeft: '200px' }}>* will override project ini, not required</small>
    </div>);
  },
});

export default connect(
  (state, props) => ({ props }),
  () => ({
    onParseError: (message) => dispatch(NetActions.errorNetworkCall('New Project', { message })),
  })
)(NewSimulation);
