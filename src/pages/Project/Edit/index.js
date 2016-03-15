import ItemEditor   from '../../../panels/ItemEditor';
import React        from 'react';

import Workflows    from '../../../workflows';
import client       from '../../../network';
import merge        from 'mout/src/object/merge';

/* eslint-disable no-alert */
export default React.createClass({

  displayName: 'Project/Edit',

  propTypes: {
    params: React.PropTypes.object,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  getInitialState() {
    return {
      project: null,
    };
  },

  componentWillMount() {
    this.updateState();
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.id !== this.props.params.id) {
      this.updateState(nextProps.params.id);
    }
  },

  onAction(action, data, attachement) {
    this[action](data, attachement);
  },

  updateState(id = this.props.params.id) {
    client.getProject(id)
      .then(resp => this.setState({ project: resp.data }))
      .catch(err => console.log('Error: Project/Edit-get', err));
  },

  editProject(data, attachement) {
    const project = merge(this.state.project, data);
    client.saveProject(project)
      .then(resp => this.context.router.replace(`/View/Project/${this.state.project._id}`))
      .catch(err => {
        this.setState({ _error: err.data.message });
        console.log('Error: Project/Edit-save', err);
      });
  },

  cancel() {
    this.context.router.replace(`/View/Project/${this.state.project._id}`);
  },

  delete() {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
    client.deleteProject(this.state.project._id)
      .then(resp => this.context.router.replace('/'))
      .catch(err => {
        this.setState({ _error: err.data.message });
        console.log('Error: Project/Edit-delete', err);
      });
  },

  render() {
    if (!this.state.project) {
      return null;
    }

    const childComponent = this.state.project.type ? Workflows[this.state.project.type].components.EditProject : null;
    const workflowAddOn = childComponent ? React.createElement(childComponent, { owner: () => this.refs.container }) : null;

    return (
      <ItemEditor
        name={this.state.project.name}
        description={this.state.project.description}
        error={this.state._error}
        ref="container"
        title="Edit Project"
        actions={[
          { name: 'delete', label: 'Delete project' },
          { name: 'cancel', label: 'Cancel' },
          { name: 'editProject', label: 'Save project' }]}
        onAction={ this.onAction }
      >{ workflowAddOn }</ItemEditor>);
  },
});
