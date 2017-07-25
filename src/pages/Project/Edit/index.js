import ItemEditor   from '../../../panels/ItemEditor';
import SharePanel   from '../../../panels/SharePanel';
import React        from 'react';

import Workflows    from '../../../workflows';
import getNetworkError  from '../../../utils/getNetworkError';

import { connect }  from 'react-redux';
import { dispatch } from '../../../redux';
import * as Router  from '../../../redux/actions/router';
import * as Actions from '../../../redux/actions/projects';

/* eslint-disable no-alert */
const ProjectEdit = React.createClass({

  displayName: 'Project/Edit',

  propTypes: {
    error: React.PropTypes.string,
    project: React.PropTypes.object,
    currentUser: React.PropTypes.string,
    onSave: React.PropTypes.func,
    onDelete: React.PropTypes.func,
    onCancel: React.PropTypes.func,
  },

  onAction(action, data, attachment) {
    this[action](data, attachment);
  },

  editProject(data, attachment) {
    this.props.onSave(Object.assign({}, this.props.project, data));
  },

  cancel() {
    this.props.onCancel('/');
  },

  delete() {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
    this.props.onDelete(this.props.project);
  },

  render() {
    const { project, error } = this.props;
    if (!project) {
      return null;
    }

    const childComponent = project.type ? Workflows[project.type].components.EditProject : null;
    const workflowAddOn = childComponent ? React.createElement(childComponent, { owner: () => this.container,
      parentProps: this.props }) : null;

    return (
      <ItemEditor
        name={ project.name }
        description={ project.description }
        error={ error }
        ref={(c) => {this.container = c;}}
        title="Edit Project"
        actions={[
          { name: 'cancel', label: 'Cancel' },
          { name: 'delete', label: 'Delete project' },
          { name: 'editProject', label: 'Save project' }]}
        onAction={ this.onAction }
      >
        { workflowAddOn }
        { this.props.currentUser === this.props.project.userId ?
          <div>
            <SharePanel shareItem={this.props.project} shareToType="users" />
            <SharePanel shareItem={this.props.project} shareToType="groups" />
          </div>
          : null
        }
      </ItemEditor>);
  },
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state, props) => {
    return {
      currentUser: state.auth.user ? state.auth.user._id : '',
      project: state.projects.mapById[props.params.id],
      error: getNetworkError(state, ['save_project', 'delete_project', 'share_project', 'unshare_project']),
    };
  },
  () => {
    return {
      onSave: (project) => dispatch(Actions.saveProject(project)),
      onDelete: (project) => dispatch(Actions.deleteProject(project)),
      onCancel: (path) => dispatch(Router.goBack()),
    };
  }
)(ProjectEdit);

