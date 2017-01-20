import { connect }  from 'react-redux';

import SimputReact  from '../../../../generic/components/steps/SimputReact';
import { dispatch } from '../../../../../redux';
import * as Actions from '../../../../../redux/actions/projects';

export default connect(
  (state, properties) => ({
    simputType: 'nwchem-neb',
    inputFileKeys: [{ key: 'nw', name: 'job.nw', parse: false }],
    initialDataModel: {
      data: {},
      type: 'nwchem-neb',
      hideViews: [],
    },
    nextStep: 'Simulation',
    simputModelDecorator(model, props) {
      // Add external data from project mesh
      if (!model.external) {
        model.external = {};
      }

      // Add start geometry
      model.external.startGeometry = props.project.metadata.startGeometry || '';
      model.external.endGeometry = props.project.metadata.endGeometry || '';

      return model;
    },
  }),
  () => ({
    saveSimulation: (simulation) => dispatch(Actions.saveSimulation(simulation)),
    updateSimulation: (simulation) => dispatch(Actions.updateSimulation(simulation)),
    patchSimulation: (simulation) => dispatch(Actions.patchSimulation(simulation)),
  })
)(SimputReact);
