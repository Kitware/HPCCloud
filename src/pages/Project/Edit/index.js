import ItemEditor   from '../../../panels/ItemEditor';
import React        from 'react';

import Workflows    from '../../../workflows';

import { connect }  from 'react-redux';
import get          from 'mout/src/object/get';
import { dispatch } from '../../../redux';
import * as Router  from '../../../redux/actions/router';
import * as Actions from '../../../redux/actions/projects';
import * as NetActions from '../../../redux/actions/network';

/* eslint-disable no-alert */
const ProjectEdit = React.createClass({

  displayName: 'Project/Edit',

  propTypes: {
    params: React.PropTypes.object,
    error: React.PropTypes.string,
    project: React.PropTypes.object,

    onSave: React.PropTypes.func,
    onDelete: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    invalidateError: React.PropTypes.func,
  },

  componentWillUnmount() {
    if (this.props.error) {
      this.props.invalidateError(this.props.project._id);
    }
  },

  onAction(action, data, attachement) {
    this[action](data, attachement);
  },

  editProject(data, attachement) {
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
    const workflowAddOn = childComponent ? React.createElement(childComponent, { owner: () => this.refs.container }) : null;

    return (
      <ItemEditor
        name={ project.name }
        description={ project.description }
        error={ error }
        ref="container"
        title="Edit Project"
        actions={[
          { name: 'cancel', label: 'Cancel' },
          { name: 'delete', label: 'Delete project' },
          { name: 'editProject', label: 'Save project' }]}
        onAction={ this.onAction }
      >{ workflowAddOn }</ItemEditor>);
  },
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state, props) => {
    var error;
    if (!get(state, 'network.error.save_project.resp.data.invalid') &&
      !get(state, `network.error.delete_project_${props.params.id}.resp.data.invalid`)) {
      error = get(state, 'network.error.save_project.resp.data.message') || get(state, `network.error.delete_project_${props.params.id}.resp.data.message`);
    }

    return {
      error,
      project: state.projects.mapById[props.params.id],
    };
  },
  () => {
    return {
      onSave: (project) => dispatch(Actions.saveProject(project)),
      onDelete: (project) => dispatch(Actions.deleteProject(project)),
      onCancel: (path) => dispatch(Router.goBack()),
      invalidateError: (id) => dispatch(NetActions.invalidateError(id)),
    };
  }
)(ProjectEdit);

