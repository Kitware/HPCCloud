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

/* eslint-disable no-undef */

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
    });

    afterEach(() => {
      // fauxJax inherits from EventEmitter, we do this afterEach because we
      // change the event listener function almost everytime
      fauxJax.removeAllListeners('request');
    });

    afterAll(() => {
      fauxJax.restore();
    });

    it('should get projects', (done) => {
      fauxJax.on('request', fauxRes(200, projectsData));
      expect(Actions.fetchProjectList())
        .toDispatchActions({ type: Actions.UPDATE_PROJECT_LIST, projects: projectsData }, complete(done));
    });

    const id = projectsData[0]._id;
    it('should get a project\'s simulations', (done) => {
      fauxJax.on('request', fauxRes(200, simulationData));
      expect(Actions.fetchProjectSimulations(id))
        .toDispatchActions({ type: Actions.UPDATE_PROJECT_SIMULATIONS, id, simulations: simulationData }, complete(done));

      // expect(projectsReducer(''))
    });
  });
});
