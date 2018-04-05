import React from 'react';
import PropTypes from 'prop-types';

/* eslint-disable import/extensions */
import Simput from 'Simput';
/* eslint-enable import/extensions */

import { FileUploadEntry } from '../../../../panels/ItemEditor';
import { dispatch } from '../../../../redux';
import * as NetActions from '../../../../redux/actions/network';

// ----------------------------------------------------------------------------

function onParseError(message) {
  dispatch(NetActions.errorNetworkCall('New Simulation', { message }));
}

// ----------------------------------------------------------------------------

function parseAndValidate(file, owner) {
  return new Promise((accept, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.readyState !== FileReader.DONE) {
        onParseError('Ini file is invalid');
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

export default function pyFrNewSimulation(props) {
  return (
    <div>
      <FileUploadEntry
        name="ini"
        label="Ini file*"
        accept=".ini"
        owner={props.owner}
        postProcess={parseAndValidate}
      />
      <small style={{ marginLeft: '200px' }}>
        * will override project ini, not required
      </small>
    </div>
  );
}

// ----------------------------------------------------------------------------

pyFrNewSimulation.propTypes = {
  owner: PropTypes.func,
};

pyFrNewSimulation.defaultProps = {
  owner: undefined,
};
