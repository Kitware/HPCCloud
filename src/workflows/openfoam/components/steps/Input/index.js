import { connect }  from 'react-redux';

import SimputReact   from '../../../../generic/components/steps/SimputReact';
import { dispatch } from '../../../../../redux';
import * as Actions from '../../../../../redux/actions/projects';

export default connect(
  state => ({
    simputType: 'openfoam_tutorials',
    inputFileKeys: [{ key: 'sh', name: 'run.sh' }],
    initialDataModel: {
      data: {},
      type: 'openfoam_tutorials',
      hideViews: [],
    },
    nextStep: 'Simulation',
  }),
  () => ({
    saveSimulation: (simulation) => dispatch(Actions.saveSimulation(simulation)),
    updateSimulation: (simulation) => dispatch(Actions.updateSimulation(simulation)),
    patchSimulation: (simulation) => dispatch(Actions.patchSimulation(simulation)),
  })
)(SimputReact);
