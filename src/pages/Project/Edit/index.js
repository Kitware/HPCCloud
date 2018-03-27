import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import ItemEditor from '../../../panels/ItemEditor';
import SharePanel from '../../../panels/SharePanel';
import { userHasAccess } from '../../../utils/AccessHelper';

import Workflows from '../../../workflows';
import getNetworkError from '../../../utils/getNetworkError';

import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/projects';

function actionsForUser(user, accessObject) {
  if (userHasAccess(user, accessObject, 'write')) {
    return [
      { name: 'cancel', label: 'Cancel' },
      { name: 'delete', label: 'Delete project' },
      { name: 'editProject', label: 'Save project' },
    ];
  }
  return [];
}

/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
class ProjectEdit extends React.Component {
  constructor(props) {
    super(props);
    this.onAction = this.onAction.bind(this);
  }

  onAction(action, data, attachment) {
    this[action](data, attachment);
  }

  editProject(data, attachment) {
    this.props.onSave(Object.assign({}, this.props.project, data));
  }

  cancel() {
    this.props.onCancel('/');
  }

  delete() {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
    this.props.onDelete(this.props.project);
  }

  render() {
    const { currentUser, project, error } = this.props;
    if (!project) {
      return null;
    }

    const childComponent = project.type
      ? Workflows[project.type].components.EditProject
      : null;
    const workflowAddOn = childComponent
      ? React.createElement(childComponent, {
          owner: () => this.container,
          parentProps: this.props,
        })
      : null;

    return (
      <ItemEditor
        name={project.name}
        description={project.description}
        error={error}
        ref={(c) => {
          this.container = c;
        }}
        title="Edit Project"
        actions={actionsForUser(currentUser, project.access)}
        onAction={this.onAction}
      >
        {workflowAddOn}
        {currentUser._id === this.props.project.userId ? (
          <div>
            <SharePanel shareItem={this.props.project} shareToType="users" />
            <SharePanel shareItem={this.props.project} shareToType="groups" />
          </div>
        ) : null}
      </ItemEditor>
    );
  }
}

ProjectEdit.propTypes = {
  error: PropTypes.string.isRequired,
  project: PropTypes.object.isRequired,
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
      return {
        currentUser: state.auth.user,
        project: state.projects.mapById[props.match.params.id],
        error: getNetworkError(state, [
          'save_project',
          'delete_project',
          'share_project',
          'unshare_project',
        ]),
        onCancel: () => props.history.goBack(),
      };
    },
    () => {
      return {
        onSave: (project) => dispatch(Actions.saveProject(project)),
        onDelete: (project) => dispatch(Actions.deleteProject(project)),
      };
    }
  )(ProjectEdit)
);
