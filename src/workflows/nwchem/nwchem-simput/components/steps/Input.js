import React from 'react';
import SimputReact from '../../../../generic/components/steps/SimputReact';

// ----------------------------------------------------------------------------

function simputModelDecorator(model, props) {
  // Add external data from project mesh
  if (!model.external) {
    model.external = {};
  }

  // Add external
  if (props.project.metadata.geometry) {
    model.external.input = props.project.metadata.geometry;
  }

  return model;
}

// ----------------------------------------------------------------------------

export default (props) => (
  <SimputReact
    {...props}
    simputType="nwchem"
    inputFileKeys={[{ key: 'nw', name: 'job.nw', parse: false }]}
    initialDataModel={{
      data: {},
      type: 'nwchem',
      hideViews: [],
    }}
    simputModelDecorator={simputModelDecorator}
  />
);
