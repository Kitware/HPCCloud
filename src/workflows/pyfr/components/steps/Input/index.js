/* global Simput */
import React                from 'react';

import SimputLabels         from 'simput/src/Labels';
import ViewMenu             from 'simput/src/ViewMenu';
import modelGenerator       from 'simput/src/modelGenerator';
import client               from '../../../../../network';
import deepClone            from 'mout/src/lang/deepClone';

import PropertyPanelBlock   from 'paraviewweb/src/React/Properties/PropertyPanel';

import style                from 'HPCCloudStyle/PageWithMenu.mcss';

export default React.createClass({

  displayName: 'PyFrSimput',

  propTypes: {
    convert: React.PropTypes.func,
    model: React.PropTypes.object,
    project: React.PropTypes.object,
    simulation: React.PropTypes.object,
    step: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      // PyFr Simput code
      model: Simput.types.pyfr.model,
      convert: Simput.types.pyfr.convert,
    };
  },

  getInitialState() {
    return {
      // ini file container
      iniFile: null,

      // Simput root data
      jsonData: { data: {} },

      // Language support
      labels: new SimputLabels(Simput.types.pyfr, 'en'),
      help: Simput.types.pyfr.lang.en.help,

      // UI content management
      data: [],
      viewData: {},
    };
  },

  componentWillMount() {
    var iniFile = this.props.simulation.metadata.inputFolder.files.iniFile;
    var jsonData = this.props.simulation.steps[this.props.step].metadata.model;

    // Create ini file container if not already here
    if (!iniFile) {
      const fileName = 'iniFile';
      client.addEmptyFileForSimulation(this.props.simulation, fileName)
        .then(resp => {
          const { _id } = resp.data; // itemId

          this.props.simulation.metadata.inputFolder.files.iniFile = _id;

          this.setState({ iniFile: _id });

          client.saveSimulation(this.props.simulation)
            .then(() => {
              client.invalidateSimulation(this.props.simulation);
            });
        });
    } else if (!this.state.iniFile) {
      this.setState({ iniFile });
    }

    // Need to fill up the jsonData
    if (!jsonData) {
      const boundaryNames = {};
      this.props.project.metadata.boundaries.forEach(name => {
        boundaryNames[name] = name;
      });

      jsonData = {
        data: {},
        type: 'pyfr',
        external: {
          'boundary-names': boundaryNames,
        },
        hideViews: [ 'backend' ],
      };

      // Update step metadata
      client.updateSimulationStep(this.props.simulation._id, this.props.step, {
        metadata: { model: JSON.stringify(jsonData) },
      }).then((resp) => {
        var newSim = deepClone(this.props.simulation);
        newSim.steps[this.props.step].metadata.model = JSON.stringify(jsonData);
        client.invalidateSimulation(newSim);
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
    const { jsonData } = this.state;

    // Update step metadata
    client.updateSimulationStep(this.props.simulation._id, this.props.step, {
      metadata: { model: JSON.stringify(jsonData) },
    }).then((resp) => {
      var newSim = deepClone(this.props.simulation);
      newSim.steps[this.props.step].metadata.model = JSON.stringify(jsonData);
      client.invalidateSimulation(newSim);
    });

    // Update ini file content
    try {
      if (this.state.iniFile) {
        const convertedData = this.props.convert(jsonData);
        const content = convertedData.results['pyfr.ini'];
        console.log('try to save content', content.length);
        const blob = new Blob([content], { type: 'text/plain' });
        client.updateFileContent(this.state.iniFile, content.length)
          .then(
            upload => {
              client.uploadChunk(upload.data._id, 0, blob);
            },
            err => {
              console.log('Error update ini content', err);
            });
      } else {
        console.log('no ini file');
      }
    } catch (e) {
      console.log('Error when generating INI file', e);
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
