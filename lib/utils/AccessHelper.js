
export const ProjectHelper = {

    getIcon(project) {
        return 'fa fa-fw fa-folder';
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
        return [{icon: 'fa fa-fw fa-pencil', name: `/Edit/Project/${project._id}` }];
    },

    getViewLink(project) {
        return `/View/Project/${project._id}`;
    },

    getEditLink(project) {
        return `/Edit/Project/${project._id}`;
    },
}

const SIMULATIONS_ICONS = [
    'fa fa-fw fa-pencil-square-o',
    'fa fa-fw fa-rocket',
    'fa fa-fw fa-database',
];

export const SimulationHelper = {

    getIcon(simulation) {
        const idx = Math.floor(Math.random() * (SIMULATIONS_ICONS.length + 1)) % SIMULATIONS_ICONS.length;
        return SIMULATIONS_ICONS[idx];
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
        return [{icon: 'fa fa-fw fa-pencil', name: `/Edit/Simulation/${simulation._id}` }];
    },

    getViewLink(simulation) {
        return `/View/Simulation/${simulation._id}`;
    },

    getEditLink(simulation) {
        return `/Edit/Simulation/${simulation._id}`;
    },
}
