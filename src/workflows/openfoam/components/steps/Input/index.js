/* global Simput */
import React                from 'react';

import SimputLabels         from 'simput/src/Labels';
import ViewMenu             from 'simput/src/ViewMenu';
import modelGenerator       from 'simput/src/modelGenerator';
import client               from '../../../../../network';
import * as simulationsHelper from '../../../../../network/helpers/simulations';
import deepClone            from 'mout/src/lang/deepClone';

import PropertyPanelBlock   from 'paraviewweb/src/React/Properties/PropertyPanel';

import style                from 'HPCCloudStyle/PageWithMenu.mcss';
import { connect } from 'react-redux';
import { dispatch } from '../../../../../redux';
import * as Actions from '../../../../../redux/actions/projects';
// import * as NetActions from '../../../../../redux/actions/network';

const SimputPanel = React.createClass({

  displayName: 'OpenFOAMSimput',

  propTypes: {
    convert: React.PropTypes.func,
    parse: React.PropTypes.func,
    model: React.PropTypes.object,
    project: React.PropTypes.object,
    simulation: React.PropTypes.object,
    step: React.PropTypes.string,
    saveSimulation: React.PropTypes.func,
    updateSimulation: React.PropTypes.func,
    patchSimulation: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      // PyFr Simput code
      model: Simput.types.openfoam_tutorials.model,
      convert: Simput.types.openfoam_tutorials.convert,
    };
  },

  getInitialState() {
    return {
      //  shell file container
      shFile: null,

      // Simput root data
      jsonData: { data: {} },

      // Language support
      labels: new SimputLabels(Simput.types.openfoam_tutorials, 'en'),
      help: Simput.types.openfoam_tutorials.lang.en.help,

      // UI content management
      data: [],
      viewData: {},
    };
  },

  componentWillMount() {
    const shFile = this.props.simulation.metadata.inputFolder.files.sh;
    let jsonData = this.props.simulation.steps[this.props.step].metadata.model;

    // Create ini file container if not already here
    let promise = null;
    if (!shFile) {
      promise = simulationsHelper.addEmptyFileForSimulation(this.props.simulation, 'run.sh')
        .then(resp => {
          const _id = resp.data._id; // itemId
          this.props.simulation.metadata.inputFolder.files.sh = _id;
          this.setState({ shFile: _id });
          const internalPromise = simulationsHelper.saveSimulation(this.props.simulation);
          internalPromise.then(() => this.props.updateSimulation(this.props.simulation));
          return internalPromise;
        });
    } else if (!this.state.shFile) {
      this.setState({ shFile });
    }


    // Need to fill up the jsonData
    if (!jsonData) {
      jsonData = {
        data: {},
        type: 'openfoam_tutorials',
        hideViews: [],
      };

      const updateSimulationStep = () => {
        // Update step metadata
        client.updateSimulationStep(this.props.simulation._id, this.props.step, {
          metadata: { model: JSON.stringify(jsonData) },
        }).then((resp) => {
          var newSim = deepClone(this.props.simulation);
          newSim.steps[this.props.step].metadata.model = JSON.stringify(jsonData);
          this.props.saveSimulation(newSim);
        });
      };

      // If we have outstanding requests ensure they are chained to avoid lost
      // updates.
      if (promise) {
        promise.then(updateSimulationStep);
      } else {
        updateSimulationStep();
      }
    } else {
      if (typeof jsonData === 'string') {
        jsonData = JSON.parse(jsonData);
      } else {
        console.log('Can not convert jsonData (?)', jsonData);
      }
    }

    // Push model to state
    this.setState({ jsonData });
  },

  componentWillUnmount() {
    this.saveModel();
  },

  saveModel() {
    const jsonData = this.state.jsonData;

    // Update step metadata
    client.updateSimulationStep(this.props.simulation._id, this.props.step, {
      metadata: { model: JSON.stringify(jsonData) },
    })
    .then((resp) => {
      var newSim = deepClone(this.props.simulation);
      newSim.steps[this.props.step].metadata.model = JSON.stringify(jsonData);
      this.props.saveSimulation(newSim);
    })
    .catch((error) => {
      console.error('problem saving model');
    });

    // Update script file content
    try {
      if (this.state.shFile) {
        const convertedData = this.props.convert(jsonData);
        const content = convertedData.results['run.sh'];

        const blob = new Blob([content], { type: 'text/plain' });
        client.updateFileContent(this.state.shFile, content.length)
          .then(upload => {
            client.uploadChunk(upload.data._id, 0, blob);
          })
          .catch(err => {
            console.log('Error update ini content', err);
          });

        const simulationStepIndex = this.props.simulation.disabled.indexOf('Simulation');
        if (simulationStepIndex !== -1) {
          const newSim = deepClone(this.props.simulation);
          newSim.disabled.splice(simulationStepIndex, 1);
          this.props.patchSimulation(newSim);
        }
      } else {
        console.log('no .sh file');
      }
    } catch (e) {
      console.error('Error when generating run.sh file: ', e);
    }
  },

  updateActive(viewId, index) {
    const data = modelGenerator(this.props.model, this.state.jsonData, viewId, index,
        this.state.labels.activeLabels.attributes, this.state.help),
      viewData = this.state.jsonData.data[viewId][index];
    this.setState({ data, viewData });
    setImmediate(this.saveModel);
  },

  updateViewData(newData) {
    const data = this.state.viewData,
      keypath = newData.id.split('.'),
      attrName = keypath.shift();
    data[attrName][keypath.join('.')].value = newData.value;
    this.setState({ viewData: data });
  },

  render() {
    if (!this.state.jsonData) {
      console.log('no jsonData in state');
      return null;
    }

    return (
      <div className={ style.container }>
          <ViewMenu
            className={ style.menu20 }
            data={ this.state.jsonData }
            model={ this.props.model }
            labels={ this.state.labels }
            onChange={ this.updateActive }
          />
          <div className={ style.content }>
              <PropertyPanelBlock
                className={ style.rootContainer }
                input={ this.state.data }
                labels={ this.state.labels }
                viewData={ this.state.viewData }
                onChange={ this.updateViewData }
              />
          </div>
      </div>);
  },
});

export default connect(
  state => ({ }),
  () => ({
    saveSimulation: (simulation) => dispatch(Actions.saveSimulation(simulation)),
    updateSimulation: (simulation) => dispatch(Actions.updateSimulation(simulation)),
    patchSimulation: (simulation) => dispatch(Actions.patchSimulation(simulation)),
  })
)(SimputPanel);
