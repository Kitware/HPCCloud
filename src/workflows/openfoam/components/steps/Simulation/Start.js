import { connect }  from 'react-redux';

import JobSubmission   from '../../../../generic/components/steps/JobSubmission';
import { dispatch }    from '../../../../../redux';
import * as Actions    from '../../../../../redux/actions/taskflows';
import * as NetActions from '../../../../../redux/actions/network';

export default connect(
  state => ({
    actionList: [{ name: 'prepareJob', label: 'Start Simulation', icon: '' }],
    clusterFilter(cluster) {
      return 'config' in cluster
        && 'openfoam' in cluster.config
        && (cluster.config.openfoam && cluster.config.openfoam.enable);
    },
    getPayload(props) {
      return {
        input: {
          folder: {
            id: props.simulation.metadata.inputFolder._id,
          },
          shFile: {
            id: props.simulation.metadata.inputFolder.files.sh,
          },
        },
        output: {
          folder: {
            id: props.simulation.metadata.outputFolder._id,
          },
        },
      };
    },
  }),
  () => ({
    onJobSubmition: (taskflowName, primaryJob, payload, simulationStep, location) =>
        dispatch(Actions.createTaskflow(taskflowName, primaryJob, payload, simulationStep, location)),
    onError: (message) => dispatch(NetActions.errorNetworkCall('create_taskflow', { data: { message } }, 'form')),
  })
)(JobSubmission);
