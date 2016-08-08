import ItemEditor   from '../../../panels/ItemEditor';
import React        from 'react';
import Workflows    from '../../../workflows';
import getNetworkError  from '../../../utils/getNetworkError';

import style        from 'HPCCloudStyle/ItemEditor.mcss';

import { connect }  from 'react-redux';
import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/projects';
import * as Router  from '../../../redux/actions/router';

const ProjectNew = React.createClass({

  displayName: 'Project/New',

  propTypes: {
    location: React.PropTypes.object,
    workflowNames: React.PropTypes.array,
    error: React.PropTypes.string,
    onSave: React.PropTypes.func,
    onCancel: React.PropTypes.func,
  },

  getInitialState() {
    return {
      _error: null,
      type: this.props.workflowNames[0].value,
    };
  },

  componentDidMount() {
    this.timeout = null;
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState._error !== this.state._error) {
      this.timeout = setTimeout(() => { this.setState({ _error: null }); }, 3000);
    }
  },

  componentWillUnmount() {
    clearTimeout(this.timeout);
  },

  onAction(action, data, attachments) {
    this[action](data, attachments);
  },

  updateForm(e) {
    var key = e.target.dataset.name,
      value = e.target.value;

    this.setState({ [key]: value });
  },

  newProject(data, attachments) {
    const { name, description } = data,
      type = this.state.type,
      orders = Workflows[type].steps._order,
      steps = Array.isArray(orders) ? orders : orders.default,
      metadata = data.metadata || {},
      project = { name, description, type, steps, metadata };

    if (!name || !name.length) {
      this.setState({ _error: 'The project needs to have a name' });
    }

    // check for requiredAttachements.
    if (Workflows[this.state.type].requiredAttachments &&
        Workflows[this.state.type].requiredAttachments.project &&
        Workflows[this.state.type].requiredAttachments.project.length) {
      const reqAttachments = Workflows[this.state.type].requiredAttachments.project;
      if (!attachments || !reqAttachments.every((el) => attachments.hasOwnProperty(el))) {
        // ['this', 'that', 'other'] => '"this", "that" and "other"'
        const reqAttachmentsStr = reqAttachments.map(el => `"${el}"`).join(', ').replace(/(, )(?!.* )/, ' and ');
        this.setState({ _error: `The project requires file${reqAttachments.length === 1 ? '' : 's'} ${reqAttachmentsStr}` });
        return;
      }
    }

    this.props.onSave(project, attachments);
  },

  cancel() {
    this.props.onCancel();
  },

  render() {
    const childComponent = this.state.type ? Workflows[this.state.type].components.NewProject : null;
    const workflowAddOn = childComponent ? React.createElement(childComponent, { owner: () => this.refs.container }) : null;
    return (
      <ItemEditor
        error={ this.state._error || this.props.error }
        ref="container"
        title="New Project"
        actions={[
          { name: 'cancel', label: 'Cancel' },
          { name: 'newProject', label: 'Create project' },
        ]}
        onAction={ this.onAction }
      >
        <section className={ style.group }>
            <label className={ style.label }> Type </label>
            <select
              className={ style.input }
              data-name="type"
              onChange={ this.updateForm }
              value={this.state.type}
            >
              { this.props.workflowNames.map((el, index) =>
                <option key={`${el.label}_${el.value}_${index}`} value={el.value}>{el.label}</option>
              )}
            </select>
        </section>
        { workflowAddOn }
      </ItemEditor>);
  },
});

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  state => {
    return {
      workflowNames: state.projects.workflowNames,
      error: getNetworkError(state, 'save_project'),
    };
  },
  () => {
    return {
      onSave: (project, attachments) => dispatch(Actions.saveProject(project, attachments)),
      onCancel: () => dispatch(Router.replace('/')),
    };
  }
)(ProjectNew);
