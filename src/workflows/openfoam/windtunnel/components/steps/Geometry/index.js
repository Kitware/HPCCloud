import React from 'react';

import vtk from 'vtk.js/Sources/vtk';
import 'vtk.js/Sources/Common/Core/Points';
import 'vtk.js/Sources/Common/Core/CellArray';
import 'vtk.js/Sources/Common/DataModel/PolyData';

import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkOBJReader from 'vtk.js/Sources/IO/Misc/OBJReader';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkOutlineFilter from 'vtk.js/Sources/Filters/General/OutlineFilter';
import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from 'vtk.js/Sources/Rendering/Core/RenderWindowInteractor';

import { dispatch } from '../../../../../../redux';
import * as Actions from '../../../../../../redux/actions/projects';
import client from '../../../../../../network';

import style from 'HPCCloudStyle/PageWithMenu.mcss';
import localStyle from './Geometry.mcss';

const BOUNDS_MAPPING = [0, 3, 1, 4, 2, 5];

const SIGN = { '-': -1, '+': 1 };
const SIGN_STR = { '-': 'minus', '+': 'plus' };
const SIGN_STR_INV = { '-': 'plus', '+': 'minus' };

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

function generateExternal(state) {
  const output = [];

  // Wind Speed
  const flowVelocity = [0, 0, 0];
  flowVelocity['xyz'.indexOf(state.direction[0])] =
    -state.speed * SIGN[state.direction[1]];
  output.push({
    path: [
      'InitialConditions',
      0,
      'initconst',
      'initialConditions.flowVelocity',
    ],
    value: flowVelocity,
  });

  // Bounds
  const bounds = state.tunnel;
  for (let i = 0; i < 3; i++) {
    output.push({
      path: ['WindTunnel', 0, 'wallBounds', `tunnel.bounds.${'xyz'[i]}`],
      value: [bounds[i * 2], bounds[i * 2 + 1]],
    });
  }

  // Wall assignment
  output.push({
    path: [
      'WindTunnel',
      0,
      'wallAssign',
      `tunnel.walls.${state.orientation[0]}.${SIGN_STR[state.orientation[1]]}`,
    ],
    value: ['topWall'],
  });
  output.push({
    path: [
      'WindTunnel',
      0,
      'wallAssign',
      `tunnel.walls.${state.orientation[0]}.${
        SIGN_STR_INV[state.orientation[1]]
      }`,
    ],
    value: ['bottomWall'],
  });
  output.push({
    path: [
      'WindTunnel',
      0,
      'wallAssign',
      `tunnel.walls.${state.direction[0]}.${SIGN_STR[state.direction[1]]}`,
    ],
    value: ['inlet'],
  });
  output.push({
    path: [
      'WindTunnel',
      0,
      'wallAssign',
      `tunnel.walls.${state.direction[0]}.${SIGN_STR_INV[state.direction[1]]}`,
    ],
    value: ['outlet'],
  });
  // We don't care for the true left/right
  const sideWallAxis = 'xyz'
    .replace(state.direction[0], '')
    .replace(state.orientation[0], '');
  output.push({
    path: ['WindTunnel', 0, 'wallAssign', `tunnel.walls.${sideWallAxis}.plus`],
    value: ['leftWall'],
  });
  output.push({
    path: ['WindTunnel', 0, 'wallAssign', `tunnel.walls.${sideWallAxis}.minus`],
    value: ['rightWall'],
  });

  // Refinement box
  const refineBox = [].concat(state.tunnel);
  const idxToReplace = [
    'xyz'.indexOf(state.direction[0]) * 2 +
      (state.direction[1] === '+' ? 1 : 0), // Inlet
  ];
  idxToReplace.forEach((idx) => {
    refineBox[idx] = state.object[idx];
  });

  output.push({
    path: ['Mesh', 0, 'searchableBox', 'meshRefinement.refinementBox.min'],
    value: [refineBox[0], refineBox[2], refineBox[4]],
  });
  output.push({
    path: ['Mesh', 0, 'searchableBox', 'meshRefinement.refinementBox.max'],
    value: [refineBox[1], refineBox[3], refineBox[5]],
  });

  return output;
}

// ----------------------------------------------------------------------------

function extract(model) {
  if (model) {
    return JSON.parse(model);
  }
  return model;
}

// ----------------------------------------------------------------------------

export default class GeometryViewer extends React.Component {
  constructor(props) {
    super(props);

    const MAX = 100000;
    this.state = extract(props.simulation.steps[props.step].metadata.model) || {
      direction: ['x', '-'],
      orientation: ['z', '+'],
      speed: 20,
      object: [-1, 1, -1, 1, -1, 1],
      tunnel: [MAX, -MAX, MAX, -MAX, MAX, -MAX],
    };

    // Capture simput data model
    this.inputModel = extract(props.simulation.steps.Input.metadata.model) || {
      data: {},
      type: 'openfoam-windtunnel',
      hideViews: [],
      external: {},
    };

    // vtk.js code
    this.vtk = {};
    this.vtk.renderWindow = vtkRenderWindow.newInstance();
    this.vtk.renderer = vtkRenderer.newInstance();
    this.vtk.renderWindow.addRenderer(this.vtk.renderer);

    // OpenGlRenderWindow
    this.vtk.openGlRenderWindow = vtkOpenGLRenderWindow.newInstance();
    this.vtk.renderWindow.addView(this.vtk.openGlRenderWindow);

    // Interactor
    this.vtk.interactor = vtkRenderWindowInteractor.newInstance();
    this.vtk.interactor.setView(this.vtk.openGlRenderWindow);
    this.vtk.interactor.initialize();

    this.vtk.tunnel = vtk({
      vtkClass: 'vtkPolyData',
      points: {
        vtkClass: 'vtkPoints',
        values: [-1, -1, -1, 1, 1, 1],
        numberOfComponents: 3,
      },
      verts: {
        vtkClass: 'vtkCellArray',
        values: [2, 0, 1],
      },
    });
    this.vtk.reader = vtkOBJReader.newInstance();
    this.vtk.mapper = vtkMapper.newInstance();
    this.vtk.actor = vtkActor.newInstance();

    this.vtk.mapper.setInputConnection(this.vtk.reader.getOutputPort());
    this.vtk.actor.setMapper(this.vtk.mapper);

    this.vtk.tunnelBounds = vtkOutlineFilter.newInstance();
    this.vtk.tunnelMapper = vtkMapper.newInstance();
    this.vtk.tunnelActor = vtkActor.newInstance();
    this.vtk.tunnelBounds.setInputData(this.vtk.tunnel);
    this.vtk.tunnelMapper.setInputConnection(
      this.vtk.tunnelBounds.getOutputPort()
    );
    this.vtk.tunnelActor.setMapper(this.vtk.tunnelMapper);
    this.vtk.renderer.addActor(this.vtk.tunnelActor);

    // Manually bind this method to the component instance...
    this.updateTunnel = this.updateTunnel.bind(this);
    this.updateRenderWindowSize = this.updateRenderWindowSize.bind(this);
    this.updateDirection = this.updateDirection.bind(this);
    this.updateSpeed = this.updateSpeed.bind(this);
    this.updateOrientation = this.updateOrientation.bind(this);
    this.updateCamera = this.updateCamera.bind(this);
    this.updateTunnelBounds = this.updateTunnelBounds.bind(this);
    this.saveModel = this.saveModel.bind(this);
  }

  componentDidMount() {
    this.vtk.openGlRenderWindow.setContainer(this.container);
    this.vtk.interactor.bindEvents(this.container);

    window.addEventListener('resize', this.updateRenderWindowSize);
    this.updateRenderWindowSize();

    const meshFileId = this.props.project.metadata.inputFolder.files.mesh;
    client.downloadFile(meshFileId, 0, null, 'inline').then((resp) => {
      this.vtk.reader.parse(resp.data);
      this.vtk.reader.update();
      const mesh = this.vtk.reader.getOutputData();
      this.vtk.renderer.addActor(this.vtk.actor);
      this.updateCamera(this.state.direction, this.state.orientation);
      const bounds = mesh.getBounds();
      this.setState({ object: [].concat(bounds) }, () => {
        this.updateTunnelBounds();
      });
    });
  }

  componentWillUnmount() {
    this.vtk.openGlRenderWindow.setContainer(null);
    this.vtk.interactor.unbindEvents(this.container);
    window.removeEventListener('resize', this.updateRenderWindowSize);

    Object.keys(this.vtk).forEach((name) => {
      this.vtk[name].delete();
      delete this.vtk[name];
    });

    this.saveModel();
  }

  updateRenderWindowSize() {
    const dims = this.container.parentNode.parentNode.getBoundingClientRect();
    this.vtk.openGlRenderWindow.setSize(dims.width, dims.height - 60);
  }

  updateTunnel() {
    let changeDetected = false;
    const tunnelPoints = this.vtk.tunnel.getPoints().getData();
    this.state.tunnel.forEach((v, i) => {
      if (tunnelPoints[BOUNDS_MAPPING[i]] !== Number(v)) {
        changeDetected = true;
      }
      tunnelPoints[BOUNDS_MAPPING[i]] = Number(v);
    });
    if (changeDetected) {
      this.vtk.tunnel.getPoints().setData(tunnelPoints, 3);
      this.vtk.tunnel.modified();
      this.vtk.renderer.resetCamera();
    }
    this.vtk.renderWindow.render();
  }

  updateDirection(e) {
    const direction = e.target.value.split(':');
    const orientation = [].concat(this.state.orientation);
    if (direction[0] === orientation[0]) {
      if ('xyz'.indexOf(direction[0]) < 2) {
        orientation[0] = 'z';
      } else {
        orientation[0] = 'y';
      }
      this.setState({ direction, orientation }, this.updateCamera);
    } else {
      this.setState({ direction }, this.updateCamera);
    }
  }

  updateSpeed(e) {
    const speed = Number(e.target.value);
    this.setState({ speed });
  }

  updateOrientation(e) {
    const orientation = e.target.value.split(':');
    this.setState({ orientation }, this.updateCamera);
  }

  updateCamera() {
    const direction = this.state.direction;
    const orientation = this.state.orientation;

    const camera = this.vtk.renderer.getActiveCamera();
    const mappingIndex = 'xyz'.indexOf(direction[0]);
    const delta = direction[1] === '+' ? 1 : -1;
    const focalPoint = camera.getFocalPoint();
    const position = focalPoint.map(
      (v, i) => (i === mappingIndex ? v + delta : v)
    );
    const viewUp = [0, 0, 0];
    viewUp['xyz'.indexOf(orientation[0])] = orientation[1] === '+' ? 1 : -1;
    camera.set({ focalPoint, position, viewUp });
    this.vtk.renderer.resetCamera();
    this.vtk.renderWindow.render();
  }

  updateTunnelBounds(e) {
    const objBounds = this.state.object;
    const tunnel = [].concat(this.state.tunnel);

    if (e) {
      const { name, value } = e.target;
      tunnel[Number(name)] = Number(value);
    }

    // Can not be smaller than object
    for (let i = 0; i < 3; i++) {
      if (tunnel[i * 2] > objBounds[i * 2]) {
        tunnel[i * 2] = objBounds[i * 2];
      }
      if (tunnel[i * 2 + 1] < objBounds[i * 2 + 1]) {
        tunnel[i * 2 + 1] = objBounds[i * 2 + 1];
      }
    }

    this.setState({ tunnel }, () => {
      this.updateTunnel();
    });
  }

  saveModel() {
    const model = JSON.stringify(this.state);
    const assign = JSON.stringify(generateExternal(this.state));

    // Push changes right away to prevent invalid data in next step
    const newSim = Object.assign({}, this.props.simulation);
    newSim.steps[this.props.step].metadata.model = model;
    newSim.steps[this.props.step].metadata.assign = assign;
    this.props.saveSimulation(newSim);

    client
      .updateSimulationStep(this.props.simulation._id, this.props.step, {
        metadata: { model, assign },
      })
      .catch((error) => {
        console.error('problem saving model (a)', error);
      });
  }

  render() {
    return (
      <div className={style.rootContainer}>
        <div className={localStyle.controlPanel}>
          <div className={localStyle.line}>
            <div className={localStyle.section}>
              <label
                className={localStyle.clickLabel}
                onClick={this.updateCamera}
              >
                Wind direction
              </label>
              <select
                className={localStyle.input}
                value={this.state.direction.join(':')}
                onChange={this.updateDirection}
              >
                <option value="x:+">X+</option>
                <option value="x:-">X-</option>
                <option value="y:+">Y+</option>
                <option value="y:-">Y-</option>
                <option value="z:+">Z+</option>
                <option value="z:-">Z-</option>
              </select>
            </div>
            <div className={localStyle.section}>
              <label className={localStyle.label}>Lift direction</label>
              <select
                className={localStyle.input}
                value={this.state.orientation.join(':')}
                onChange={this.updateOrientation}
              >
                {this.state.direction[0] !== 'x' ? (
                  <option value="x:+">X+</option>
                ) : null}
                {this.state.direction[0] !== 'x' ? (
                  <option value="x:-">X-</option>
                ) : null}
                {this.state.direction[0] !== 'y' ? (
                  <option value="y:+">Y+</option>
                ) : null}
                {this.state.direction[0] !== 'y' ? (
                  <option value="y:-">Y-</option>
                ) : null}
                {this.state.direction[0] !== 'z' ? (
                  <option value="z:+">Z+</option>
                ) : null}
                {this.state.direction[0] !== 'z' ? (
                  <option value="z:-">Z-</option>
                ) : null}
              </select>
            </div>
            <div className={localStyle.section}>
              <label className={localStyle.label}>Wind speed</label>
              <input
                className={localStyle.input}
                type="number"
                value={this.state.speed}
                onChange={this.updateSpeed}
              />
            </div>
          </div>
          <div className={localStyle.line}>
            <div className={localStyle.section}>
              <label className={localStyle.label}>X</label>
              <div className={localStyle.vertical}>
                <input
                  className={localStyle.input}
                  type="number"
                  name="0"
                  value={this.state.tunnel[0]}
                  onChange={this.updateTunnelBounds}
                />
                <input
                  className={localStyle.input}
                  type="number"
                  name="1"
                  value={this.state.tunnel[1]}
                  onChange={this.updateTunnelBounds}
                />
              </div>
            </div>
            <div className={localStyle.section}>
              <label className={localStyle.label}>Y</label>
              <div className={localStyle.vertical}>
                <input
                  className={localStyle.input}
                  type="number"
                  name="2"
                  value={this.state.tunnel[2]}
                  onChange={this.updateTunnelBounds}
                />
                <input
                  className={localStyle.input}
                  type="number"
                  name="3"
                  value={this.state.tunnel[3]}
                  onChange={this.updateTunnelBounds}
                />
              </div>
            </div>
            <div className={localStyle.section}>
              <label className={localStyle.label}>Z</label>
              <div className={localStyle.vertical}>
                <input
                  className={localStyle.input}
                  type="number"
                  name="4"
                  value={this.state.tunnel[4]}
                  onChange={this.updateTunnelBounds}
                />
                <input
                  className={localStyle.input}
                  type="number"
                  name="5"
                  value={this.state.tunnel[5]}
                  onChange={this.updateTunnelBounds}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={localStyle.view} ref={(c) => (this.container = c)} />
      </div>
    );
  }
}

GeometryViewer.propTypes = {
  nextStep: React.PropTypes.string,

  project: React.PropTypes.object,
  simulation: React.PropTypes.object,
  step: React.PropTypes.string,
  saveSimulation: React.PropTypes.func,
  updateSimulation: React.PropTypes.func,
  patchSimulation: React.PropTypes.func,
};

GeometryViewer.defaultProps = {
  saveSimulation,
  updateSimulation,
  patchSimulation,
};
