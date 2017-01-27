/* global Simput */
import React                from 'react';
import { FileUploadEntry }  from '../../../../panels/ItemEditor';

import { dispatch } from '../../../../redux';
import * as NetActions from '../../../../redux/actions/network';

// ----------------------------------------------------------------------------

function onParseError(message) {
  dispatch(NetActions.errorNetworkCall('New Project', { message }));
}

// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------

function parseAndValidate(file, owner) {
  return new Promise((accept, reject) => {
    var reader = new FileReader();
    reader.onloadend = () => {
      if (reader.readyState !== FileReader.DONE) {
        this.props.onParseError('Ini file is invalid');
        reject();
      }
      try {
        Simput.types.pyfr.parse('pyfr', { 'pyfr.ini': reader.result });
      } catch (e) {
        onParseError(`Error parsing file:\n${e}`);
        owner().removeMetadata('ini');
        reject();
      }
      accept({});
    };

    reader.readAsText(file);
  });
}

// ----------------------------------------------------------------------------

export default function pyFrNewProject(props) {
  return (
    <div>
      <FileUploadEntry name="mesh" label="Mesh (msh, pyfrm)" accept=".msh,.pyfrm" owner={props.owner} postProcess={extractPhysicalNames} />
      <FileUploadEntry name="ini" label="Ini file" accept=".ini" owner={props.owner} postProcess={parseAndValidate} />
    </div>);
}

// ----------------------------------------------------------------------------

pyFrNewProject.propTypes = {
  owner: React.PropTypes.func,
};
