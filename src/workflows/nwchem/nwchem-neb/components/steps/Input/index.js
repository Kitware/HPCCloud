/* global Simput */
import React                from 'react';

import SimputLabels         from 'simput/src/Labels';
import ViewMenu             from 'simput/src/ViewMenu';
import modelGenerator       from 'simput/src/modelGenerator';
import client               from '../../../../../../network';
import * as simulationsHelper from '../../../../../../network/helpers/simulations';
import deepClone            from 'mout/src/lang/deepClone';

import PropertyPanelBlock   from 'paraviewweb/src/React/Properties/PropertyPanel';

import style                from 'HPCCloudStyle/PageWithMenu.mcss';
import { connect } from 'react-redux';
import { dispatch } from '../../../../../../redux';
import * as Actions from '../../../../../../redux/actions/projects';


const SimputPanel = React.createClass({

  displayName: 'NWChemSimput',

  propTypes: {
    convert: React.PropTypes.func,
    model: React.PropTypes.object,
    project: React.PropTypes.object,
    simulation: React.PropTypes.object,
    step: React.PropTypes.string,
    updateSimulation: React.PropTypes.func,
    saveSimulation: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      // PyFr Simput code
      model: Simput.types.nwchem_neb.model,
      convert: Simput.types.nwchem_neb.convert,
    };
  },

  getInitialState() {
    return {
      // nw file container
      nwFile: null,

      // Simput root data
      jsonData: { data: {} },

      // Language support
      labels: new SimputLabels(Simput.types.nwchem_neb, 'en'),
      help: Simput.types.nwchem_neb.lang.en.help || {},

      // UI content management
      data: [],
      viewData: {},
    };
  },

  componentWillMount() {
    var nwFile = this.props.simulation.metadata.inputFolder.files.nw;
    var jsonData = this.props.simulation.steps[this.props.step].metadata.model;

    // Create ini file container if not already here
    let promise = null;
    if (!nwFile) {
      promise = simulationsHelper.addEmptyFileForSimulation(this.props.simulation, 'job.nw')
        .then(resp => {
          const _id = resp.data._id; // itemId
          this.props.simulation.metadata.inputFolder.files.nw = _id;
          this.setState({ nwFile: _id });
          return simulationsHelper.saveSimulation(this.props.simulation)
            .then(() => this.props.updateSimulation(this.props.simulation));
        });
    } else if (!this.state.nwFile) {
      this.setState({ nwFile });
    }

    // Need to fill up the jsonData
    if (!jsonData) {
      jsonData = {
        data: {},
        type: 'nwchem',
        external: { input: this.props.simulation.metadata.inputFolder.geometry },
        hideViews: [],
      };

      const updateSimulationStep = () => {
        // Update step metadata
        client.updateSimulationStep(this.props.simulation._id, this.props.step, {
          metadata: { model: JSON.stringify(jsonData) },
        }).then((resp) => {
          var newSim = deepClone(this.props.simulation);
          newSim.steps[this.props.step].metadata.model = JSON.stringify(jsonData);
          newSim.metadata.here = 'here';
          this.props.saveSimulation(newSim);
        });
      };

      // If we have outstanding requests ensure they are chained to avoid lost
      // updates.
      if (promise) {
        this.promise.then(updateSimulationStep);
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

  componentDidMount() {
    client.downloadFile(
        this.props.project.metadata.inputFolder.files.startGeometry, null,
          null, null)
        .then((resp) => {
          this.setState({
            startGeometry: resp.data,
          });
        })
        .catch((error) => {
          console.error('Unable to fetch starting geometry.');
        });

    client.downloadFile(
        this.props.project.metadata.inputFolder.files.endGeometry, null,
          null, null)
        .then((resp) => {
          this.setState({
            endGeometry: resp.data,
          });
        })
        .catch((error) => {
          console.error('Unable to fetch final geometry.');
        });
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

    // Update ini file content
    try {
      if (this.state.nwFile) {
        jsonData.startGeometry = {
          value: [this.state.startGeometry],
        };

        jsonData.endGeometry = {
          value: [this.state.endGeometry],
        };

        const convertedData = this.props.convert(jsonData);
        console.log(convertedData);
        const content = convertedData.results['job.nw'];
        console.log('try to save content', content.length);
        const blob = new Blob([content], { type: 'text/plain' });
        client.updateFileContent(this.state.nwFile, content.length)
          .then(upload => {
            client.uploadChunk(upload.data._id, 0, blob);
          })
          .catch(err => {
            console.log('Error update nw content', err);
          });
        const simulationStepIndex = this.props.simulation.disabled.indexOf('Simulation');
        if (simulationStepIndex !== -1) {
          this.props.simulation.disabled.splice(simulationStepIndex, 1);
          simulationsHelper.updateDisabledSimulationSteps(this.props.simulation);
        }
      } else {
        console.log('no .nw file');
      }
    } catch (e) {
      console.error('Error when generating .nw file', e);
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
    console.log(attrName, keypath, newData);
    data[attrName][keypath.join('.')].value = newData.value;
    console.log(data, data[attrName][keypath.join('.')].value);
    this.setState({ viewData: data });
  },

  render() {
    if (!this.state.jsonData) {
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
  })
)(SimputPanel);
