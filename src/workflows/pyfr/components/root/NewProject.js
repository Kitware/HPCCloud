/* global Simput */
import React                from 'react';
import { FileUploadEntry }  from '../../../../panels/ItemEditor';

import { connect }  from 'react-redux';
import { dispatch } from '../../../../redux';
import * as NetActions from '../../../../redux/actions/network';

function extractPhysicalNames(file) {
  return new Promise((accept, reject) => {
    var reader = new FileReader();
    var boundaries = [];

    reader.onload = function onLoad(e) {
      var keepLooking = true;
      const text = reader.result;
      const lines = text.split(/[\r\n]+/g);
      const nbLines = lines.length;

      for (let i = 0; keepLooking && i < nbLines; i++) {
        keepLooking = (lines[i].indexOf('PhysicalNames') === -1);
        if (!keepLooking) {
          const nbNames = Number(lines[i + 1]);
          for (let nIdx = 0; nIdx < nbNames; nIdx++) {
            boundaries.push(lines[i + 2 + nIdx].split('"')[1]);
          }
        }
      }

      // Return the list of boundaries
      accept({ boundaries });
    };

    reader.readAsText(file);
  });
}

const NewProject = React.createClass({

  displayName: 'Project/New/PyFR',

  propTypes: {
    owner: React.PropTypes.func,
    onParseError: React.PropTypes.func,
  },

  parseAndValidate(file) {
    return new Promise((accept, reject) => {
      var reader = new FileReader();
      reader.onloadend = function onLoad() {
        if (reader.readyState !== FileReader.DONE) {
          this.props.onParseError('Ini file is invalid');
          reject();
        }
        try {
          Simput.types.pyfr.parse('pyfr', reader.result);
        } catch (e) {
          this.props.onParseError('Ini file is invalid');
          reject();
        }
        accept({});
      };

      reader.readAsText(file);
    });
  },

  render() {
    return (<div>
      <FileUploadEntry name="mesh" label="Mesh (msh, pyfrm)" accept=".msh,.pyfrm" owner={ this.props.owner } postProcess={ extractPhysicalNames } />
      <FileUploadEntry name="ini" label="Ini file" accept=".ini" owner={ this.props.owner } postProcess={ this.parseAndValidate } />
    </div>);
  },
});

export default connect(
  (state, props) => ({ props }),
  () => ({
    onParseError: (message) => dispatch(NetActions.errorNetworkCall('New Project', { message })),
  })
)(NewProject);

