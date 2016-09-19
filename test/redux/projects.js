import * as Actions from '../../src/redux/actions/projects';
import projectsReducer, { initialState } from '../../src/redux/reducers/projects';
import simulationsReducer, { simInitialState } from '../../src/redux/reducers/simulations';
import { store } from '../../src/redux';
import client from '../../src/network';
import * as ProjectHelper from '../../src/network/helpers/projects';
import * as SimulationHelper from '../../src/network/helpers/simulations';

import deepClone from 'mout/src/lang/deepClone';
import projectsData from '../sampleData/projectsData';
import simulationData from '../sampleData/simulationsForProj1';

import expect from 'expect';
import complete from '../helpers/complete';
import { registerAssertions } from 'redux-actions-assertions/expect';
/* global describe it afterEach */

registerAssertions();

function setSpy(target, method, data) {
  expect.spyOn(target, method)
    .andReturn(Promise.resolve({ data }));
}

describe('project actions', () => {
  // ----------------------------------------------------------------------------
  // SIMPLE ACTIONS
  // ----------------------------------------------------------------------------
  describe('basic actions', () => {
    const newState = Object.assign({}, initialState);
    it('should update a project list', (done) => {
      const expectedAction = { type: Actions.UPDATE_PROJECT_LIST, projects: projectsData };

      expect(Actions.updateProjectList(projectsData))
        .toDispatchActions(expectedAction, complete(done));

      newState.list = projectsData.map((el) => el._id);
      projectsData.forEach((el) => {
        newState.mapById[el._id] = el;
      });
      expect(projectsReducer(initialState, expectedAction))
        .toEqual(newState);
    });

    it('should update project simulations', (done) => {
      const id = projectsData[0]._id;
      const expectedAction = { type: Actions.UPDATE_PROJECT_SIMULATIONS, id, simulations: simulationData };
      expect(Actions.updateProjectSimulations(id, simulationData))
        .toDispatchActions(expectedAction, complete(done));

      expect(Object.keys(projectsReducer(initialState, expectedAction).simulations[id]).length)
        .toEqual(simulationData.length);
    });

    it('should update project data', (done) => {
      const project = projectsData[0];
      expect(Actions.updateProject(project))
        .toDispatchActions({ type: Actions.UPDATE_PROJECT, project }, complete(done));
    });

    it('should update simulation data', (done) => {
      const simulation = simulationData[0];
      expect(Actions.updateSimulation(simulation))
        .toDispatchActions({ type: Actions.UPDATE_SIMULATION, simulation }, complete(done));
    });
  });

  // ----------------------------------------------------------------------------
  // AYSYNCHRONUS ACTIONS
  // ----------------------------------------------------------------------------
  describe('async actions', () => {
    afterEach(() => {
      expect.restoreSpies();
    });

    it('should get projects', (done) => {
      setSpy(client, 'listProjects', projectsData);
      expect(Actions.fetchProjectList())
        .toDispatchActions({ type: Actions.UPDATE_PROJECT_LIST }, complete(done));
    });

    const id = projectsData[0]._id;
    it('should get a project\'s simulations', (done) => {
      setSpy(client, 'listSimulations', simulationData);
      expect(Actions.fetchProjectSimulations(id))
        .toDispatchActions({ type: Actions.UPDATE_PROJECT_SIMULATIONS, id, simulations: simulationData }, complete(done));
      expect(client.listSimulations).toHaveBeenCalled();
    });

    it('should save a project', (done) => {
      setSpy(ProjectHelper, 'saveProject', projectsData[0]);
      expect(Actions.saveProject(projectsData[0]))
        .toDispatchActions({ type: Actions.UPDATE_PROJECT, project: projectsData[0] }, complete(done));
    });

    it('should delete a project', (done) => {
      setSpy(client, 'deleteProject', projectsData[0]);
      expect(Actions.deleteProject(projectsData[0]))
        .toDispatchActions({ type: 'REMOVE_PROJECT', project: projectsData[0] }, complete(done));
    });
  });
});

// ----------------------------------------------------------------------------
// SIMULATIONS
// ----------------------------------------------------------------------------

describe('simulation actions', () => {
  describe('simple actions', () => {
    it('should update Simulation', (done) => {
      const projId = projectsData[0]._id;
      const expectedAction = { type: Actions.UPDATE_SIMULATION, simulation: simulationData[0] };
      expect(Actions.updateSimulation(simulationData[0]))
        .toDispatchActions(expectedAction, complete(done));

      expect(projectsReducer(initialState, expectedAction).simulations[projId].list)
        .toContain(simulationData[0]._id);

      const expectedSim = simulationData[0];
      const expectedState = deepClone(simInitialState);
      expectedState.mapById[expectedSim._id] = expectedSim;
      expect(simulationsReducer(simInitialState, expectedAction))
        .toEqual(expectedState);
    });
  });

  describe('async actions', () => {
    afterEach(() => {
      expect.restoreSpies();
    });

    it('should save simulation', (done) => {
      const expectedSim = Object.assign({}, simulationData[0]);
      const expectedAction = { type: Actions.UPDATE_SIMULATION, simulation: expectedSim };
      setSpy(SimulationHelper, 'saveSimulation', expectedSim);

      expect(Actions.saveSimulation(expectedSim))
        .toDispatchActions(expectedAction, complete(done));
    });

    it('should update simulation step, delete the old taskflow', (done) => {
      const newStatus = 'complete';
      const newTaskflowId = 'some_id';
      const expectedSim = deepClone(simulationData[0]);
      expectedSim.steps.Simulation.status = newStatus;
      expectedSim.steps.Simulation.metadata.taskflowId = newTaskflowId;

      const expectedActions = [
        { type: 'DELETE_TASKFLOW', id: simulationData[0].steps.Simulation.metadata.taskflowId },
        { type: Actions.UPDATE_SIMULATION, simulation: expectedSim },
      ];

      // we need to manually add the simulation to the state.
      store.getState().simulations.mapById[simulationData[0]._id] = simulationData[0];

      setSpy(client, 'updateSimulationStep', expectedSim);
      setSpy(client, 'deleteTaskflow', '');
      expect(Actions.updateSimulationStep(expectedSim._id, 'Simulation', { status: 'complete', metadata: { taskflowId: newTaskflowId } }))
        .toDispatchActions(expectedActions, complete(done));
    });

    it('should delete simulation and its taskflows', (done) => {
      const deletedSim = Object.assign({}, simulationData[0]);
      const expectedActions = [
        { type: Actions.REMOVE_SIMULATION, simulation: deletedSim },
        { type: 'DELETE_TASKFLOW', id: simulationData[0].steps.Simulation.metadata.taskflowId },
        { type: 'DELETE_TASKFLOW', id: 'viz_taskflow_id' },
      ];
      setSpy(client, 'deleteSimulation', null);
      setSpy(client, 'deleteTaskflow', '');
      expect(Actions.deleteSimulation(deletedSim))
        .toDispatchActions(expectedActions, complete(done));
    });
  });
});
