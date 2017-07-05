import React            from 'react';
import ImageIcon        from '../widgets/ImageIcon';
import IconActionList   from '../panels/IconActionList';

import style from 'HPCCloudStyle/Theme.mcss';
let Workflow;
if (process.env.NODE_ENV !== 'test') {
  Workflow = require('../workflows').default;
} else {
  Workflow = { test: { name: 'test', logo: 'my-logo' } };
}

/* eslint-disable new-cap */
const SHORT_DESCRIPTION_SIZE = 80;

// Girder access levels
const accessTypes = [
  'READ',
  'WRITE',
  'ADMIN',
];

// user(obj): full user object,
// objAccess(obj): access object of the simulation or project
// atLeastAccess(int|string): check that the user has at least this access level
export function userHasAccess(user, objAccess, atLeastAccess) {
  const accessLevel = typeof atLeastAccess === 'number' ? accessTypes[atLeastAccess]
    : accessTypes.indexOf(atLeastAccess);

  // check groups
  const groups = objAccess.groups;
  for (let i = 0; i < groups.length; i++) {
    if (user.groups.indexOf(groups[i].id) !== -1 && groups[i].level >= accessLevel) {
      return true;
    }
  }

  // check user
  const users = objAccess.users;
  for (let i = 0; i < users.length; i++) {
    if (user._id === users[i].id && users[i].level >= accessLevel) {
      return true;
    }
  }

  return false;
}

export const projectFunctions = {
  getIcon(project) {
    const ret = {
      image: Workflow[project.type] ? Workflow[project.type].logo : '',
    };
    return ret;
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

  getSimulationCount(project) {
    const count = project.metadata.simulationCount || 0;
    return `${count} ${count === 1 ? 'simulation' : 'simulations'}`;
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

export const ProjectHelper = {
  columns: ['', 'Name', 'Description', 'Created', 'Updated', 'Simulations', ''],
  cellContentFunctions: [
    (item) => <ImageIcon data={projectFunctions.getIcon(item)} />,
    projectFunctions.getName,
    projectFunctions.getDescription,
    projectFunctions.getCreationDate,
    projectFunctions.getUpdateDate,
    projectFunctions.getSimulationCount,
  ],
  actionItem: (item, onAction) => <IconActionList actions={projectFunctions.getActions(item)} onAction={onAction} />,
  viewLink: projectFunctions.getViewLink,
  editLink: projectFunctions.getEditLink,
};

const SIMULATIONS_ICONS = {
  created: style.simulationEditIcon,
  running: style.simulationRunningIcon,
  error: style.simulationErrorIcon,
  terminated: style.simulationTerminateIcon,
  complete: style.simulationDoneIcon,
};

export const simulationFunctions = {

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

  getStep(simulation) {
    return simulation.active;
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

export const SimulationHelper = {
  columns: ['', 'Name', 'Description', 'Created', 'Updated', 'Step', ''],
  cellContentFunctions: [
    (item) => <ImageIcon data={simulationFunctions.getIcon(item)} />,
    simulationFunctions.getName,
    simulationFunctions.getDescription,
    simulationFunctions.getCreationDate,
    simulationFunctions.getUpdateDate,
    simulationFunctions.getStep,
  ],
  actionItem: (item, onAction) => <IconActionList actions={simulationFunctions.getActions(item)} onAction={onAction} />,
  viewLink: simulationFunctions.getViewLink,
  editLink: simulationFunctions.getEditLink,
};
