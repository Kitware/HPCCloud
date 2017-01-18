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
const pendingDownload = [];
const callbacks = {};

export default connect(
  (state, properties) => {
    // Trigger download
    if (!fileContainer[properties.project._id]) {
      fileContainer[properties.project._id] = {};
    }

    // Download startGeometry
    try {
      const startGeometry = properties.project.metadata.inputFolder.files.startGeometry;
      if (startGeometry && pendingDownload.indexOf(startGeometry) === -1) {
        pendingDownload.push(properties.project.metadata.inputFolder.files.startGeometry);
        client.downloadFile(
          properties.project.metadata.inputFolder.files.startGeometry, null, null, null)
          .then((resp) => {
            fileContainer[properties.project._id].startGeometry = resp.data;
            if (callbacks[properties.simulation._id]) {
              callbacks[properties.simulation._id]();
            }
          })
          .catch((error) => {
            console.error('Unable to fetch starting geometry.', error);
          });
      } else if (pendingDownload.indexOf(startGeometry) === -1) {
        console.error('No start geometry in project.metadata.inputFolder.files', properties);
      }
    } catch (startGeometryError) {
      console.error('Error when dealing with startGeometry', startGeometryError);
    }

    // Download endGeometry
    try {
      const endGeometry = properties.project.metadata.inputFolder.files.endGeometry;
      if (endGeometry && pendingDownload.indexOf(endGeometry) === -1) {
        pendingDownload.push(properties.project.metadata.inputFolder.files.endGeometry);
        client.downloadFile(
          properties.project.metadata.inputFolder.files.endGeometry, null, null, null)
          .then((resp) => {
            fileContainer[properties.project._id].endGeometry = resp.data;
            if (callbacks[properties.simulation._id]) {
              callbacks[properties.simulation._id]();
            }
          })
          .catch((error) => {
            console.error('Unable to fetch starting geometry.', error);
          });
      } else if (pendingDownload.indexOf(endGeometry) === -1) {
        console.error('No start geometry in project.metadata.inputFolder.files', properties);
      }
    } catch (endGeometryError) {
      console.error('Error when dealing with endGeometry', endGeometryError);
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
      simputModelDecorator(model, props, asyncReady) {
        if (asyncReady) {
          callbacks[props.simulation._id] = asyncReady;
        }

        // Add external data from project mesh
        if (!model.external) {
          model.external = {};
        }

        // Add external
        // --------------------------------------------------------------------
        // FIXME: Chris
        // ===> Does not seems to make sens for NWChem-neg
        // --------------------------------------------------------------------
        // if (props.simulation.metadata.inputFolder.geometry) {
        //   model.external.input = props.simulation.metadata.inputFolder.geometry;
        // } else {
        //   console.error('No simulation geometry');
        // }
        // --------------------------------------------------------------------

        // Add start geometry
        if (fileContainer[props.project._id].startGeometry) {
          model.external.startGeometry = fileContainer[props.project._id].startGeometry;
        } else if (!fileContainer[props.project._id].startGeometry) {
          model.external.startGeometry = '';
        }

        // Add end geometry
        if (fileContainer[props.project._id].endGeometry) {
          model.external.endGeometry = fileContainer[props.project._id].endGeometry;
        } else if (!fileContainer[props.project._id].endGeometry) {
          model.external.endGeometry = '';
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
