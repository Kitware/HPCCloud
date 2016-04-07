import ItemEditor   from '../../../panels/ItemEditor';
import React        from 'react';
import Workflows    from '../../../workflows';

import style        from 'HPCCloudStyle/ItemEditor.mcss';

import { connect }  from 'react-redux';
import get          from 'mout/src/object/get';
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

  onAction(action, data, attachements) {
    this[action](data, attachements);
  },

  updateForm(e) {
    var key = e.target.dataset.name,
      value = e.target.value;

    this.setState({ [key]: value });
  },

  newProject(data, attachements) {
    const { name, description } = data,
      type = this.state.type,
      orders = Workflows[type].steps._order,
      steps = Array.isArray(orders) ? orders : orders.default,
      metadata = data.metadata || {},
      project = { name, description, type, steps, metadata };

    if (name && name.length) {
      this.props.onSave(project, attachements);
    } else {
      this.setState({ _error: 'The project needs to have a name' });
    }
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
      error: get(state, 'network.error.save_project.resp.data.message'),
    };
  },
  () => {
    return {
      onSave: (project, attachements) => dispatch(Actions.saveProject(project, attachements)),
      onCancel: () => dispatch(Router.replace('/')),
    };
  }
)(ProjectNew);
