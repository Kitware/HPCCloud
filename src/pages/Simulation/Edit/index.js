import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import breadCrumbStyle from 'HPCCloudStyle/Theme.mcss';

import ItemEditor from '../../../panels/ItemEditor';
import SharePanel from '../../../panels/SharePanel';
import { userHasAccess } from '../../../utils/AccessHelper';
import Workflows from '../../../workflows';

import getNetworkError from '../../../utils/getNetworkError';

import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/projects';

function actionsForUser(user, accessObject, props) {
  if (userHasAccess(user, accessObject, 'write')) {
    return [
      { name: 'cancel', label: 'Cancel' },
      {
        name: 'delete',
        label: 'Delete simulation',
        disabled: props.simulation.metadata.status === 'running',
      },
      { name: 'editSimulation', label: 'Save simulation' },
    ];
  }
  return [];
}

/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
class SimulationEdit extends React.Component {
  constructor(props) {
    super(props);
    this.onAction = this.onAction.bind(this);
  }

  onAction(action, data, attachment) {
    this[action](data, attachment);
  }

  editSimulation(data, attachment) {
    this.props.onSave(Object.assign({}, this.props.simulation, data));
  }

  cancel() {
    this.props.onCancel(`/View/Project/${this.props.simulation.projectId}`);
  }

  delete() {
    if (!confirm('Are you sure you want to delete this simulation?')) {
      return;
    }
    this.props.onDelete(
      this.props.simulation,
      `/View/Project/${this.props.simulation.projectId}`
    );
  }

  render() {
    if (!this.props.simulation || !this.props.project) {
      return null;
    }

    const { currentUser, simulation, project, error } = this.props;
    const projectId = simulation.projectId;
    const childComponent = project.type
      ? Workflows[project.type].components.EditSimulation
      : null;
    const workflowAddOn = childComponent
      ? React.createElement(childComponent, {
          owner: () => this.container,
          parentProps: this.props,
        })
      : null;

    return (
      <ItemEditor
        breadcrumb={{
          paths: [
            '/',
            `/View/Project/${projectId}`,
            `/View/Simulation/${simulation._id}`,
          ],
          icons: [
            breadCrumbStyle.breadCrumbRootIcon,
            breadCrumbStyle.breadCrumbProjectIcon,
            breadCrumbStyle.breadCrumbSimulationIcon,
          ],
        }}
        name={simulation.name}
        description={simulation.description}
        error={error}
        ref={(c) => {
          this.container = c;
        }}
        title="Edit Simulation"
        actions={actionsForUser(currentUser, simulation.access, this.props)}
        onAction={this.onAction}
      >
        {workflowAddOn}
        {currentUser._id === this.props.simulation.userId ? (
          <div>
            <SharePanel shareItem={this.props.simulation} shareToType="users" />
            <SharePanel
              shareItem={this.props.simulation}
              shareToType="groups"
            />
          </div>
        ) : null}
      </ItemEditor>
    );
  }
}

SimulationEdit.propTypes = {
  error: PropTypes.string.isRequired,
  project: PropTypes.object.isRequired,
  simulation: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default withRouter(
  connect(
    (state, props) => {
      const simId = props.match.params.id;
      const simulation = state.simulations.mapById[simId];
      let project = {};
      if (simulation && simulation.projectId) {
        project = state.projects.mapById[simulation.projectId];
      }
      return {
        currentUser: state.auth.user,
        error: getNetworkError(state, [
          'save_simulation',
          `delete_simulation_${props.match.params.id}`,
        ]),
        project,
        simulation,
        onCancel: (path) => props.history.goBack(),
      };
    },
    () => {
      return {
        onSave: (simulation) =>
          dispatch(
            Actions.saveSimulation(
              simulation,
              null,
              `/View/Project/${simulation.projectId}`
            )
          ),
        onDelete: (simulation, location) =>
          dispatch(Actions.deleteSimulation(simulation, location)),
      };
    }
  )(SimulationEdit)
);
