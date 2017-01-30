import React       from 'react';
import SimputReact from '../../../../generic/components/steps/SimputReact';

// ----------------------------------------------------------------------------

function simputModelDecorator(model, props) {
  // Add external data from project mesh
  if (!model.external) {
    model.external = {};
  }

  // Add start geometry
  model.external.startGeometry = props.project.metadata.startGeometry || '';
  model.external.endGeometry = props.project.metadata.endGeometry || '';

  return model;
}

// ----------------------------------------------------------------------------

export default (props) => (
  <SimputReact
    {...props}

    simputType="nwchem-neb"
    inputFileKeys={[{ key: 'nw', name: 'job.nw', parse: false }]}
    initialDataModel={{
      data: {},
      type: 'nwchem-neb',
      hideViews: [],
    }}
    simputModelDecorator={simputModelDecorator}
  />);
