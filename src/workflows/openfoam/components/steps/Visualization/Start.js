import { connect }  from 'react-redux';

import JobSubmission   from '../../../../generic/components/steps/JobSubmission';
import { dispatch }    from '../../../../../redux';
import * as Actions    from '../../../../../redux/actions/taskflows';
import * as NetActions from '../../../../../redux/actions/network';

// ----------------------------------------------------------------------------

export default connect(
  state => ({
    actionList: [{ name: 'prepareJob', label: 'Start Visualization', icon: '' }],
    getPayload(props) {
      const sessionKey = props.simulation.steps.Visualization.folderId;
      const dataDir = props.simulation.steps.Visualization.metadata.dataDir;
      const fileName = props.simulation.steps.Visualization.metadata.fileName;

      return {
        dataDir, // where the output for the sim will be
        fileName, // the file to load
        sessionKey, // for pvw, we use this later for connecting,
        output: {
          folder: {
            id: props.simulation.steps.Visualization.folderId,
          },
        },
      };
    },
    getTaskflowMetaData(props) {
      const dataDir = props.simulation.steps.Visualization.metadata.dataDir;
      const fileName = props.simulation.steps.Visualization.metadata.fileName;
      return {
        dataDir,
        fileName,
        sessionId: props.simulation.steps.Visualization.folderId,
      };
    },
  }),
  () => ({
    onJobSubmition: (taskflowName, primaryJob, payload, simulationStep, location) =>
        dispatch(Actions.createTaskflow(taskflowName, primaryJob, payload, simulationStep, location)),
    onError: (message) => dispatch(NetActions.errorNetworkCall('create_taskflow', { data: { message } }, 'form')),
  })
)(JobSubmission);
