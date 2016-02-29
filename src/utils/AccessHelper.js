import Workflow from '../workflows';
import style from 'HPCCloudStyle/Theme.mcss';

export const ProjectHelper = {

    getIcon(project) {
        return { image: Workflow[project.type].logo };
    },

    getName(project) {
        return project.name;
    },

    getDescription(project) {
        return project.description;
    },

    getCreationDate(project) {
        return new Date(Date.parse(project.created)).toUTCString();
    },

    getUpdateDate(project) {
        return new Date(Date.parse(project.updated)).toUTCString();
    },

    getActions(project) {
        return [{icon: style.editIcon, name: `/Edit/Project/${project._id}` }];
    },

    getViewLink(project) {
        return `/View/Project/${project._id}`;
    },

    getEditLink(project) {
        return `/Edit/Project/${project._id}`;
    },
}

const SIMULATIONS_ICONS = {
    'created': style.simulationEditIcon,
    'running': style.simulationRunningIcon,
    'complete': style.simulationDoneIcon,
};

export const SimulationHelper = {

    getIcon(simulation) {
        return { icon: SIMULATIONS_ICONS[simulation.steps[simulation.active].status] };
    },

    getName(simulation) {
        return simulation.name;
    },

    getDescription(simulation) {
        return simulation.description;
    },

    getCreationDate(simulation) {
        return new Date(Date.parse(simulation.created)).toUTCString();
    },

    getUpdateDate(simulation) {
        return new Date(Date.parse(simulation.updated)).toUTCString();
    },

    getActions(simulation) {
        return [{icon: style.editIcon, name: `/Edit/Simulation/${simulation._id}` }];
    },

    getViewLink(simulation) {
        return `/View/Simulation/${simulation._id}`;
    },

    getEditLink(simulation) {
        return `/Edit/Simulation/${simulation._id}`;
    },
}
