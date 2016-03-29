import Workflow from '../workflows';
import style from 'HPCCloudStyle/Theme.mcss';

const SHORT_DESCRIPTION_SIZE = 80;

export const ProjectHelper = {

  getIcon(project) {
    return {
      image: Workflow[project.type].logo,
    };
  },

  getName(project) {
    return project.name;
  },

  getDescription(project, short = false) {
    if (short && project.description.length > SHORT_DESCRIPTION_SIZE) {
      return `${project.description.substring(0, SHORT_DESCRIPTION_SIZE)}...`;
    }
    return project.description;
  },

  getCreationDate(project, short = false) {
    const str = `${new Date(Date.parse(project.created)).toUTCString()}`;
    if (short) {
      const dateList = str.split(' ');
      dateList.pop(); // remove time zone
      dateList.pop(); // remove hh:mm:ss
      return dateList.join(' ');
    }
    return str;
  },

  getUpdateDate(project, short = false) {
    const str = `${new Date(Date.parse(project.updated)).toUTCString()}`;
    if (short) {
      const dateList = str.split(' ');
      dateList.pop(); // remove time zone
      dateList.pop(); // remove hh:mm:ss
      return dateList.join(' ');
    }
    return str;
  },

  getActions(project) {
    return [{
      icon: style.editIcon,
      name: `edit:${project._id}`,
    }];
  },

  getViewLink(project) {
    return `/View/Project/${project._id}`;
  },

  getEditLink(project) {
    return `/Edit/Project/${project._id}`;
  },
};

const SIMULATIONS_ICONS = {
  created: style.simulationEditIcon,
  running: style.simulationRunningIcon,
  error: style.simulationErrorIcon,
  terminated: style.simulationTerminateIcon,
  complete: style.simulationDoneIcon,
};

export const SimulationHelper = {

  getIcon(simulation) {
    return { icon: SIMULATIONS_ICONS[simulation.metadata.status] };
  },

  getName(simulation) {
    return simulation.name;
  },

  getDescription(simulation, short = false) {
    if (short && simulation.description.length > SHORT_DESCRIPTION_SIZE) {
      return `${simulation.description.substring(0, SHORT_DESCRIPTION_SIZE)}...`;
    }
    return simulation.description;
  },

  getCreationDate(simulation, short = false) {
    const str = `${new Date(Date.parse(simulation.created)).toUTCString()}`;
    if (short) {
      const dateList = str.split(' ');
      dateList.pop(); // remove time zone
      dateList.pop(); // remove hh:mm:ss
      return dateList.join(' ');
    }
    return str;
  },

  getUpdateDate(simulation, short = false) {
    const str = `${new Date(Date.parse(simulation.updated)).toUTCString()}`;
    if (short) {
      const dateList = str.split(' ');
      dateList.pop(); // remove time zone
      dateList.pop(); // remove hh:mm:ss
      return dateList.join(' ');
    }
    return str;
  },

  getActions(simulation) {
    return [{ icon: style.editIcon, name: `edit:${simulation._id}` }];
  },

  getViewLink(simulation) {
    return `/View/Simulation/${simulation._id}`;
  },

  getEditLink(simulation) {
    return `/Edit/Simulation/${simulation._id}`;
  },
};
