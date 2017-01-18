import { connect }  from 'react-redux';

import SimputReact  from '../../../../generic/components/steps/SimputReact';
import { dispatch } from '../../../../../redux';
import * as Actions from '../../../../../redux/actions/projects';
import client       from '../../../../../network';

const fileInfo = {};

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
    simputModelDecorator(model, props, asynch) {
      // Add external data from project mesh
      if (!model.external) {
        model.external = {};
      }

      // Download metadata for file
      const geoFileId = props.project.metadata.inputFolder.files.geometry;
      if (geoFileId && !fileInfo[geoFileId]) {
        fileInfo[geoFileId] = {};
        client.getFile(geoFileId)
          .then(resp => {
            fileInfo[geoFileId].file = resp.data;
            if (fileInfo[geoFileId].callback) {
              fileInfo[geoFileId].callback();
            }
          });
      }

      if (geoFileId && asynch) {
        fileInfo[geoFileId].callback = asynch;
      }

      // Add external
      if (fileInfo[geoFileId].file) {
        model.external.input = fileInfo[geoFileId].file.name;
        console.log('Update input of model', model.external.input);
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
