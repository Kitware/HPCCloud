import React       from 'react';
import SimputReact from '../../../../../generic/components/steps/SimputReact';

// ----------------------------------------------------------------------------

function simputModelDecorator(model, props) {
  // Add external data from project mesh
  if (!model.external) {
    model.external = {};
  }
  if (!model.external.geometryName) {
    model.external.geometryName = props.project.metadata.mesh.split('.')[0];
  }
  if (!model.external.groupName && model.external.geometryName) {
    model.external.groupName = `${model.external.geometryName}Group`;
  }

  return model;
}

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

    simputModelDecorator={simputModelDecorator}
  />);
