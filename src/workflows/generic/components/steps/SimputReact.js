import React                  from 'react';

/* eslint-disable import/extensions */
import Simput                 from 'Simput';
/* eslint-enable import/extensions */
import SimputLabels           from 'simput/src/Labels';
import ViewMenu               from 'simput/src/ViewMenu';
import modelGenerator         from 'simput/src/modelGenerator';
import client                 from '../../../../network';
import * as simulationsHelper from '../../../../network/helpers/simulations';
import deepClone              from 'mout/src/lang/deepClone';

import PropertyPanelBlock     from 'paraviewweb/src/React/Properties/PropertyPanel';

import { dispatch }           from '../../../../redux';
import * as Actions           from '../../../../redux/actions/projects';

import style                  from 'HPCCloudStyle/PageWithMenu.mcss';

// ----------------------------------------------------------------------------

function saveSimulation(simulation) {
  dispatch(Actions.saveSimulation(simulation));
}

// ----------------------------------------------------------------------------

function updateSimulation(simulation) {
  dispatch(Actions.updateSimulation(simulation));
}

// ----------------------------------------------------------------------------

function patchSimulation(simulation) {
  dispatch(Actions.patchSimulation(simulation));
}

// ----------------------------------------------------------------------------

export default class SimputReact extends React.Component {
  constructor(props) {
    super(props);

    // Manually bind this method to the component instance...
    this.saveModel = this.saveModel.bind(this);
    this.updateActive = this.updateActive.bind(this);
    this.updateViewData = this.updateViewData.bind(this);

    // Manage internal state
    const simputModule = Simput.types[this.props.simputType];
    const promises = [];
    this.fileNameToKeyMap = {};
    this.state = {
      // Simput root data
      jsonData: props.simputModelDecorator(props.initialDataModel, props, this.saveModel),

      // Language support
      labels: new SimputLabels(Simput.types[props.simputType], 'en'),
      help: Simput.types[props.simputType].lang.en.help,

      // UI content management
      data: [],
      viewData: {},
    };

    // Register all files in state
    props.inputFileKeys.forEach(({ key, name }) => {
      this.fileNameToKeyMap[name] = key;
      this.state[key] = null;
      this.fileContent = {};

      // Check if the file is part of project but not part of the simulation
      if (this.props.project.metadata.inputFolder.files[key] && !this.props.simulation.metadata.inputFolder.files[key]) {
        // Any project file that can be edited in simulation should be copied
        // into simulation so local edits could be performed within a simulation
        // without changing the project.
        promises.push(client.downloadFile(this.props.project.metadata.inputFolder.files[key], 0, null, 'inline')
          // Upload file to simulation
          .then((resp) => {
            // Capture file content in case we need to parse it
            this.fileContent[key] = resp.data;
            return simulationsHelper.addFileForSimulationWithContents(this.props.simulation, key, name, resp.data);
          })
          // update file id in simulation metadata
          .then((resp) => {
            const _id = resp._id; // file Id, custom response
            const newSim = deepClone(this.props.simulation);
            newSim.metadata.inputFolder.files[key] = _id;
            this.setState({ [key]: _id });
            return simulationsHelper.saveSimulation(newSim);
          }));
      }
    });

    props.inputFileKeys.forEach(({ key, name }) => {
      // Process simulation file if any
      Promise.all(promises).then(() => {
        const inputFile = this.props.simulation.metadata.inputFolder.files[key];
        if (!inputFile) {
          promises.push(simulationsHelper.addEmptyFileForSimulation(this.props.simulation, key, name)
            .then((resp) => {
              const _id = resp.data._id; // itemId
              const newSim = deepClone(this.props.simulation);
              newSim.metadata.inputFolder.files[key] = _id;
              this.setState({ [key]: _id });
              const internalPromise = simulationsHelper.saveSimulation(newSim);
              internalPromise.then(() => this.props.updateSimulation(newSim));
              return internalPromise;
            }));
        } else {
          this.setState({ [key]: inputFile });
        }
      });
    });

    // Handle simput data model if any
    let jsonData = this.props.simulation.steps[this.props.step].metadata.model;
    if (jsonData) {
      if (typeof jsonData === 'string') {
        this.state.jsonData = props.simputModelDecorator(JSON.parse(jsonData), props);
      } else {
        console.log('Can not convert jsonData (?)', jsonData);
      }
    } else {
      // Generic empty value
      jsonData = props.simputModelDecorator(props.initialDataModel, props);

      // Make sure all previous network calls are done
      Promise.all(promises).then(() => {
        const updateSimulationStep = () => {
          jsonData = props.simputModelDecorator(jsonData, props);
          this.setState({ jsonData });
          // Update step metadata
          client.updateSimulationStep(this.props.simulation._id, this.props.step, {
            metadata: { model: JSON.stringify(jsonData) },
          }).then((resp) => {
            var newSim = deepClone(this.props.simulation);
            newSim.steps[this.props.step].metadata.model = JSON.stringify(jsonData);
            this.props.saveSimulation(newSim);
          });
        };

        // We don't have any data model but we might be able to generate one
        // by parsing data
        if (simputModule.parse && props.inputFileKeys.filter((i) => i.parse).length) {
          // Ensure we have content for all the file we need to parse
          props.inputFileKeys.filter((i) => i.parse).forEach(({ key, name }) => {
            if (!this.fileContent[key] && this.props.simulation.metadata.inputFolder.files[key]) {
              const internalPromise = client.downloadFile(this.props.simulation.metadata.inputFolder.files[key], 0, null, 'inline');
              promises.push(internalPromise);
              internalPromise.then((resp) => {
                this.fileContent[key] = resp.data;
              });
            }
          });
          Promise.all(promises).then(() => {
            const fileNameToContentMap = {};
            props.inputFileKeys.filter((i) => i.parse).forEach(({ key, name }) => {
              fileNameToContentMap[name] = this.fileContent[key];
            });
            try {
              jsonData = Object.assign({}, jsonData, { data: simputModule.parse(props.simputType, fileNameToContentMap) });
              updateSimulationStep();
            } catch (parseError) {
              jsonData = props.initialDataModel;
              updateSimulationStep();
              console.log('Parsing error', parseError);
              console.log('Data to parse', fileNameToContentMap);
            }
          });
        } else {
          updateSimulationStep();
        }
      });
    }
  }

  componentWillUnmount() {
    this.saveModel();
  }

  saveModel() {
    // Update step metadata with the latest json data model
    const jsonData = this.props.simputModelDecorator(this.state.jsonData, this.props);
    const model = JSON.stringify(jsonData);
    client.updateSimulationStep(this.props.simulation._id, this.props.step, {
      metadata: { model },
    })
    .then((resp) => {
      var newSim = deepClone(this.props.simulation);
      newSim.steps[this.props.step].metadata.model = model;
      this.props.saveSimulation(newSim);
    })
    .catch((error) => {
      console.error('problem saving model');
    });

    // Generate new input files and update content on server
    try {
      const convertedData = Simput.types[this.props.simputType].convert(jsonData);
      if (!convertedData.errors || convertedData.errors.length === 0) {
        // No error in convertion
        if (this.state.__export__) {
          const fileId = this.state.__export__;
          const content = JSON.stringify(convertedData);
          const blob = new Blob([content], { type: 'text/plain' });
          client.updateFileContent(fileId, content.length)
            .then((upload) => {
              client.uploadChunk(upload.data._id, 0, blob);
            })
            .catch((err) => {
              console.log('Error update content __export__', err);
            });

          const simulationStepIndex = this.props.simulation.disabled.indexOf(this.props.nextStep);
          if (simulationStepIndex !== -1) {
            const newSim = deepClone(this.props.simulation);
            newSim.disabled.splice(simulationStepIndex, 1);
            this.props.patchSimulation(newSim);
          }
        } else {
          Object.keys(convertedData.results).forEach((fileName) => {
            const fileKey = this.fileNameToKeyMap[fileName];
            if (this.state[fileKey]) {
              const fileId = this.state[fileKey];
              const content = convertedData.results[fileName];
              const blob = new Blob([content], { type: 'text/plain' });
              client.updateFileContent(fileId, content.length)
                .then((upload) => {
                  client.uploadChunk(upload.data._id, 0, blob);
                })
                .catch((err) => {
                  console.log('Error update content', fileKey, fileName, err);
                });

              const simulationStepIndex = this.props.simulation.disabled.indexOf(this.props.nextStep);
              if (simulationStepIndex !== -1) {
                const newSim = deepClone(this.props.simulation);
                newSim.disabled.splice(simulationStepIndex, 1);
                this.props.patchSimulation(newSim);
              }
            } else {
              console.log(`No file id associated with generated file name: ${fileName}`);
              console.log(fileName, this.fileNameToKeyMap, this.state);
            }
          });
        }
      } else {
        console.error('Got errors when generating files from simput model: ');
        convertedData.errors.forEach((error) => console.error(error));
      }
    } catch (e) {
      console.error('Error when generating files from simput model: ', e);
    }
  }

  updateActive(viewId, index) {
    const data = modelGenerator(
        Simput.types[this.props.simputType].model,
        this.state.jsonData,
        viewId,
        index,
        this.state.labels.activeLabels.attributes,
        this.state.help);
    const viewData = this.state.jsonData.data[viewId][index];
    this.setState({ data, viewData });
    setImmediate(this.saveModel);
  }

  updateViewData(newData) {
    const data = this.state.viewData;
    const keypath = newData.id.split('.');
    const attrName = keypath.shift();

    data[attrName][keypath.join('.')].value = newData.value;
    this.setState({ viewData: data });
  }

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
            model={ Simput.types[this.props.simputType].model }
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
  }
}

SimputReact.propTypes = {
  simputType: React.PropTypes.string,
  inputFileKeys: React.PropTypes.array, // [{ key: 'sh', name: 'run.sh', parse: false }, ...]
  initialDataModel: React.PropTypes.object,
  nextStep: React.PropTypes.string,
  simputModelDecorator: React.PropTypes.func,

  project: React.PropTypes.object,
  simulation: React.PropTypes.object,
  step: React.PropTypes.string,
  saveSimulation: React.PropTypes.func,
  updateSimulation: React.PropTypes.func,
  patchSimulation: React.PropTypes.func,
};

SimputReact.defaultProps = {
  simputType: '',
  inputFileKeys: [],
  initialDataModel: null,
  nextStep: 'Simulation',
  simputModelDecorator: (m, props, asynReady) => m,
  saveSimulation,
  updateSimulation,
  patchSimulation,
};
