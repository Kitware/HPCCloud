import React from 'react';
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

  // Push Geometry step data to simput...
  if (props.simulation.steps.Geometry.metadata.assign) {
    const assign = JSON.parse(props.simulation.steps.Geometry.metadata.assign);
    while (assign.length) {
      const item = assign.pop();
      let container = model.data;
      item.path.forEach((key, idx, array) => {
        if (!container[key]) {
          if (Number.isInteger(array[idx + 1])) {
            container[key] = [];
          } else {
            container[key] = {};
          }
        }
        container = container[key];
      });
      container.value = item.value;
    }
  }

  console.log(JSON.stringify(model, null, 2));

  return model;
}

// ----------------------------------------------------------------------------

export default (props) => (
  <SimputReact
    {...props}
    simputType="openfoam-windtunnel"
    inputFileKeys={[
      { key: '__export__', name: 'input-deck.json', parse: false },
    ]}
    initialDataModel={{
      data: {},
      type: 'openfoam-windtunnel',
      hideViews: [],
    }}
    simputModelDecorator={simputModelDecorator}
  />
);
