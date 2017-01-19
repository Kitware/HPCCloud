import { connect }  from 'react-redux';

import SimputReact  from '../../../../generic/components/steps/SimputReact';
import { dispatch } from '../../../../../redux';
import * as Actions from '../../../../../redux/actions/projects';

export default connect(
  (state, properties) => ({
    simputType: 'nwchem',
    inputFileKeys: [{ key: 'nw', name: 'job.nw', parse: false }],
    initialDataModel: {
      data: {},
      type: 'nwchem',
      hideViews: [],
    },
    nextStep: 'Simulation',
    simputModelDecorator(model, props) {
      // Add external data from project mesh
      if (!model.external) {
        model.external = {};
      }

      // Add external
      if (props.project.metadata.geometry) {
        model.external.input = props.project.metadata.geometry;
      }

      return model;
    },
  }),
  () => ({
    saveSimulation: (simulation) => dispatch(Actions.saveSimulation(simulation)),
    updateSimulation: (simulation) => dispatch(Actions.updateSimulation(simulation)),
    patchSimulation: (simulation) => dispatch(Actions.patchSimulation(simulation)),
  })
)(SimputReact);
