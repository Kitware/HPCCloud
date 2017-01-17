import { connect }  from 'react-redux';

import SimputReact   from '../../../../generic/components/steps/SimputReact';
import { dispatch } from '../../../../../redux';
import * as Actions from '../../../../../redux/actions/projects';

export default connect(
  state => ({
    simputType: 'pyfr',
    inputFileKeys: [{ key: 'ini', name: 'pyfr.ini', parse: true }],
    initialDataModel: {
      data: {},
      type: 'pyfr',
      hideViews: ['backend'],
    },
    nextStep: 'Simulation',
    simputModelDecorator(model, props) {
      // Add external data from project mesh
      if (!model.external) {
        model.external = {};
      }
      if (!model.external['boundary-names']) {
        model.external['boundary-names'] = {};
      }
      if (props.project.metadata.boundaries) {
        model.external['boundary-names'] = {};
        props.project.metadata.boundaries.forEach(name => {
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
    },
  }),
  () => ({
    saveSimulation: (simulation) => dispatch(Actions.saveSimulation(simulation)),
    updateSimulation: (simulation) => dispatch(Actions.updateSimulation(simulation)),
    patchSimulation: (simulation) => dispatch(Actions.patchSimulation(simulation)),
  })
)(SimputReact);
