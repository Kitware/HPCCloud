import Monologue from 'monologue.js';

class Observable {}
Monologue.mixInto(Observable);

const notification = new Observable();
const SIMULATION_CHANGE = 'data.simulation.change';
const PROJECT_CHANGE = 'data.project.change';


export function invalidateSimulation(simulation) {
    notification.emit(SIMULATION_CHANGE, simulation);
}

export function onSimulationChange(cb) {
    return notification.on(SIMULATION_CHANGE, cb);
}

export function invalidateProject(project) {
    notification.emit(PROJECT_CHANGE, project);
}

export function onProjectChange(cb) {
    return notification.on(PROJECT_CHANGE, cb);
}
