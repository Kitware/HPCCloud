import React       from 'react';
import SimputReact from '../../../../generic/components/steps/SimputReact';

// ----------------------------------------------------------------------------

function simputModelDecorator(model, props) {
  // Add external data from project mesh
  if (!model.external) {
    model.external = {};
  }
  if (!model.external['boundary-names']) {
    model.external['boundary-names'] = {};
  }
  if (props.project.metadata.boundaries) {
    model.external['boundary-names'] = {};
    props.project.metadata.boundaries.forEach((name) => {
      model.external['boundary-names'][name] = name;
    });
  }

  // Ensure we will never see the backend view
  if (!model.hideViews) {
    model.hideViews = ['backend'];
  }
  if (model.hideViews && model.hideViews.indexOf('backend') === -1) {
    model.hideViews.push('backend');
  }
  return model;
}

// ----------------------------------------------------------------------------

export default (props) => (
  <SimputReact
    {...props}

    simputType="pyfr"
    inputFileKeys={[{ key: 'ini', name: 'pyfr.ini', parse: true }]}
    initialDataModel={{
      data: {},
      type: 'pyfr',
      hideViews: ['backend'],
    }}
    simputModelDecorator={simputModelDecorator}
  />);
