import cachedData           from './InitialCache';
import values               from 'mout/src/object/values';
import { deleteSimulation } from './Simulation';

export function listProjects(cb) {
    cb(values(cachedData.projects));
}

export function getProject(id, cb) {
    cb(cachedData.projects[id]);
}

export function saveProject(project, cb) {
    if(!project.id) {
        project.id = Math.random().toString(36).substring(7);
    }
    cachedData.projects[project.id] = project;
    cb(project);
}

export function deleteProject(id, cb) {
    const project = cachedData.projects[id];

    if(project && project.simulationIds) {
        project.simulationIds.forEach( simId => {
            deleteSimulation(simId, ()=>{} );
        })
    }

    delete cachedData.projects[id];
    cb(project);
}
