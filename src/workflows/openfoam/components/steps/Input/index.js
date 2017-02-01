import React       from 'react';
import SimputReact from '../../../../generic/components/steps/SimputReact';

// ----------------------------------------------------------------------------

export default (props) => (
  <SimputReact
    {...props}

    simputType="openfoam_tutorials"
    inputFileKeys={[{ key: 'sh', name: 'run.sh', parse: false }]}
    initialDataModel={{
      data: {},
      type: 'openfoam_tutorials',
      hideViews: [],
    }}
  />);
