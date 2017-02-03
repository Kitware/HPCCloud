import React       from 'react';
import SimputReact from '../../../../../generic/components/steps/SimputReact';

// ----------------------------------------------------------------------------

export default (props) => (
  <SimputReact
    {...props}

    simputType="openfoam-windtunnel"
    inputFileKeys={[{ key: '__export__', name: 'input-deck.json', parse: false }]}
    initialDataModel={{
      data: {},
      type: 'openfoam-windtunnel',
      hideViews: [],
    }}
  />);
