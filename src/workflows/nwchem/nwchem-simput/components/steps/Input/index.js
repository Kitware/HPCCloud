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
      model: Simput.types.nwchem.model,
      convert: Simput.types.nwchem.convert,
    };
  },

  getInitialState() {
    return {
      // ini file container
      iniFile: null,

      // Simput root data
      jsonData: { data: {} },

      // Language support
      labels: new SimputLabels(Simput.types.nwchem, 'en'),
      help: Simput.types.nwchem.lang.en.help,

      // UI content management
      data: [],
      viewData: {},
    };
  },

  componentWillMount() {
    var iniFile = this.props.simulation.metadata.inputFolder.files.ini;
    var jsonData = this.props.simulation.steps[this.props.step].metadata.model;

    // Create ini file container if not already here
    if (!iniFile) {
      simulationsHelper.addEmptyFileForSimulation(this.props.simulation, 'job.nw')
        .then(resp => {
          const _id = resp.data._id; // itemId
          this.props.simulation.metadata.inputFolder.files.ini = _id;
          this.setState({ nwFile: _id });
          simulationsHelper.saveSimulation(this.props.simulation)
            .then(() => {
              this.props.updateSimulation(this.props.simulation);
            });
        });
    } else if (!this.state.iniFile) {
      this.setState({ iniFile });
    }

    // Need to fill up the jsonData
    if (!jsonData) {
      const boundaryNames = {};
      if (this.props.project.metadata.boundaries) {
        this.props.project.metadata.boundaries.forEach(name => {
          boundaryNames[name] = name;
        });
      }

      jsonData = {
        data: {},
        type: 'nwchem',
        external: { molecules: boundaryNames },
        hideViews: [],
      };

      // Update step metadata
      client.updateSimulationStep(this.props.simulation._id, this.props.step, {
        metadata: { model: JSON.stringify(jsonData) },
      }).then((resp) => {
        var newSim = deepClone(this.props.simulation);
        newSim.steps[this.props.step].metadata.model = JSON.stringify(jsonData);
        this.props.saveSimulation(newSim);
      });
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

    // Update ini file content
    try {
      if (this.state.iniFile) {
        const convertedData = this.props.convert(jsonData);
        console.log(convertedData);
        const content = convertedData.results['job.nw'];
        console.log('try to save content', content.length);
        const blob = new Blob([content], { type: 'text/plain' });
        client.updateFileContent(this.state.iniFile, content.length)
          .then(upload => {
            client.uploadChunk(upload.data._id, 0, blob);
          })
          .catch(err => {
            console.log('Error update ini content', err);
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
