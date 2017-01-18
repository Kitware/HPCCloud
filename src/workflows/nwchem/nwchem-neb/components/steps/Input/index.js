import { connect }  from 'react-redux';

import SimputReact  from '../../../../../generic/components/steps/SimputReact';
import { dispatch } from '../../../../../../redux';
import * as Actions from '../../../../../../redux/actions/projects';
import client       from '../../../../../../network';

// {
//    [projectID]: {
//       startGeometry: 'content...',
//       endGeometry: 'content...',
//    }
// }
const fileContainer = {};

export default connect(
  (state, properties) => {
    // Trigger download
    console.log('init nwchem', properties);
    if (!fileContainer[properties.project._id]) {
      fileContainer[properties.project._id] = {};
    }
    const fileContentContainer = fileContainer[properties.project._id];

    // Download startGeometry
    if (properties.project.metadata.inputFolder.files.startGeometry) {
      client.downloadFile(
        properties.project.metadata.inputFolder.files.startGeometry, null, null, null)
        .then((resp) => {
          fileContentContainer.startGeometry = resp.data;
        })
        .catch((error) => {
          console.error('Unable to fetch starting geometry.');
        });
    } else {
      console.error('No start geometry in project.metadata.inputFolder.files', properties);
    }
    // Download endGeometry
    if (properties.project.metadata.inputFolder.files.endGeometry) {
      client.downloadFile(
        properties.project.metadata.inputFolder.files.endGeometry, null, null, null)
        .then((resp) => {
          fileContentContainer.endGeometry = resp.data;
        })
        .catch((error) => {
          console.error('Unable to fetch starting geometry.');
        });
    } else {
      console.error('No start geometry in project.metadata.inputFolder.files', properties);
    }
    // ------------------------------------------------------------------------

    // Return new props
    return {
      simputType: 'nwchem-neb',
      inputFileKeys: [{ key: 'nw', name: 'job.nw', parse: false }],
      initialDataModel: {
        data: {},
        type: 'nwchem-neb',
        hideViews: [],
      },
      nextStep: 'Simulation',
      simputModelDecorator(model, props) {
        let errorCount = 0;

        // Add external data from project mesh
        if (!model.external) {
          model.external = {};
        }

        // Add external
        if (props.simulation.metadata.inputFolder.geometry) {
          model.external.input = props.simulation.metadata.inputFolder.geometry;
        } else {
          console.error('No simulation geometry');
          errorCount++;
        }

        // Add start geometry
        if (!model.external.startGeometry && fileContainer[props.project._id].startGeometry) {
          model.external.startGeometry = { value: [fileContainer[props.project._id].startGeometry] };
        } else if (!fileContainer[props.project._id].startGeometry) {
          console.log('no start geometry yet');
          errorCount++;
        }

        // Add end geometry
        if (!model.external.endGeometry && fileContainer[props.project._id].endGeometry) {
          model.external.endGeometry = { value: [fileContainer[props.project._id].endGeometry] };
        } else if (!fileContainer[props.project._id].endGeometry) {
          console.log('no end geometry yet');
          errorCount++;
        }

        if (errorCount === 0) {
          console.log('The model is all set... GOOD');
        }

        return model;
      },
    };
  },
  () => ({
    saveSimulation: (simulation) => dispatch(Actions.saveSimulation(simulation)),
    updateSimulation: (simulation) => dispatch(Actions.updateSimulation(simulation)),
    patchSimulation: (simulation) => dispatch(Actions.patchSimulation(simulation)),
  })
)(SimputReact);
