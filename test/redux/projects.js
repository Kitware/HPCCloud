import * as Actions from '../../src/redux/actions/projects';
import projectsReducer from '../../src/redux/reducers/projects';
import { initialState } from '../../src/redux/reducers/projects';

import projectsData from '../sampleData/projectsData';
import simulationData from '../sampleData/simulationsForProj1';

import expect from 'expect';
import thunk from 'redux-thunk';
import { registerMiddlewares } from 'redux-actions-assertions';
import { registerAssertions } from 'redux-actions-assertions/expect';
import fauxJax from 'faux-jax';
const req = 'request';
/* global describe it afterEach afterAll beforeAll */

registerMiddlewares([thunk]);
registerAssertions();

describe('project actions', () => {
  // ----------------------------------------------------------------------------
  // SIMPLE ACTIONS
  // ----------------------------------------------------------------------------
  describe('basic actions', () => {
    const newState = Object.assign({}, initialState);
    it('should update a project list', () => {
      const expectedAction = { type: Actions.UPDATE_PROJECT_LIST, projects: projectsData };

      expect(Actions.updateProjectList(projectsData))
        .toDispatchActions(expectedAction);

      newState.list = projectsData.map((el) => el._id);
      projectsData.forEach((el) => {
        newState.mapById[el._id] = el;
      });
      expect(projectsReducer(initialState, expectedAction))
        .toEqual(newState);
    });

    it('should update project simulations', () => {
      const id = projectsData[0]._id;
      const expectedAction = { type: Actions.UPDATE_PROJECT_SIMULATIONS, id, simulations: simulationData };
      expect(Actions.updateProjectSimulations(id, simulationData))
        .toDispatchActions(expectedAction);

      expect(Object.keys(projectsReducer(initialState, expectedAction).simulations[id]).length)
        .toEqual(simulationData.length);
    });

    it('should update project data', () => {
      const project = projectsData[0];
      expect(Actions.updateProject(project))
        .toDispatchActions({ type: Actions.UPDATE_PROJECT, project });
    });

    it('should update simulation data', () => {
      const simulation = simulationData[0];
      expect(Actions.updateSimulation(simulation))
        .toDispatchActions({ type: Actions.UPDATE_SIMULATION, simulation });
    });
  });

  // ----------------------------------------------------------------------------
  // AYSYNCHRONUS ACTIONS
  // ----------------------------------------------------------------------------
  function fauxRes(replyCode, replyData) {
    return (request) => {
      request.respond(replyCode, { 'Content-Type': 'application/json' }, JSON.stringify(replyData));
    };
  }

  function complete(done) {
    return (err) => {
      if (err) {
        done.fail(err);
      }
      done();
    };
  }

  describe('async actions', () => {
    beforeAll(() => {
      fauxJax.install();
      // fauxJax.setMaxListeners(1);
    });

    afterEach(() => {
      // fauxJax inherits from EventEmitter, we do this afterEach because we
      // change the event listener function almost everytime
      fauxJax.removeAllListeners(req);
    });

    afterAll(() => {
      fauxJax.restore();
    });

    it('should get projects', (done) => {
      fauxJax.on(req, fauxRes(200, projectsData));
      expect(Actions.fetchProjectList())
        .toDispatchActions({ type: Actions.UPDATE_PROJECT_LIST, projects: projectsData }, complete(done));
    });

    const id = projectsData[0]._id;
    it('should get a project\'s simulations', (done) => {
      fauxJax.on(req, fauxRes(200, simulationData));
      expect(Actions.fetchProjectSimulations(id))
        .toDispatchActions({ type: Actions.UPDATE_PROJECT_SIMULATIONS, id, simulations: simulationData }, complete(done));
    });

    it('should delete a project', (done) => {
      fauxJax.on(req, fauxRes(200, projectsData[0]));
      expect(Actions.deleteProject(projectsData[0]))
        .toDispatchActions({ type: 'REMOVE_PROJECT', project: projectsData[0] }, complete(done));
    });

    it('should save a project', (done) => {
      fauxJax.on(req, fauxRes(200, projectsData[0]));
      expect(Actions.saveProject(projectsData[0]))
        .toDispatchActions({ type: Actions.UPDATE_PROJECT, project: projectsData[0] }, complete(done));
    });

    it('should update simulation step', (done) => {
      const expectedSim = Object.assign({}, simulationData[0]);
      expectedSim.steps.Introduction.status = 'complete';
      fauxJax.on(req, fauxRes(202, expectedSim));
      expect(Actions.updateSimulationStep(expectedSim._id, 'Introduction', { status: 'complete' }))
        .toDispatchActions({ type: Actions.UPDATE_SIMULATION, simulation: expectedSim }, complete(done));
    });

    it('should delete simulation', (done) => {
      const deletedSim = Object.assign({}, simulationData[0]);
      fauxJax.on(req, fauxRes(200, null));
      expect(Actions.deleteSimulation(deletedSim))
        .toDispatchActions({ type: Actions.REMOVE_SIMULATION, simulation: deletedSim }, complete(done));
    });
  });
});
