import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import style from 'HPCCloudStyle/ItemEditor.mcss';

import ItemEditor from '../../../panels/ItemEditor';
import Workflows from '../../../workflows';
import getNetworkError from '../../../utils/getNetworkError';

import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/projects';

class ProjectNew extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      _error: null,
      type: this.props.workflowNames[0].value,
    };
    this.onAction = this.onAction.bind(this);
    this.updateForm = this.updateForm.bind(this);
  }

  componentDidMount() {
    this.timeout = null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState._error !== this.state._error) {
      this.timeout = setTimeout(() => {
        this.setState({ _error: null });
      }, 3000);
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  onAction(action, data, attachments) {
    this[action](data, attachments);
  }

  updateForm(e) {
    const key = e.target.dataset.name;
    const value = e.target.value;

    this.setState({ [key]: value });
  }

  newProject(data, attachments) {
    const { name, description } = data;
    const type = this.state.type;
    const orders = Workflows[type].steps._order;
    const steps = Array.isArray(orders) ? orders : orders.default;
    const metadata = data.metadata || {};
    const project = { name, description, type, steps, metadata };

    if (!name || !name.length) {
      this.setState({ _error: 'The project needs to have a name' });
    }

    // check for requiredAttachments.
    if (
      Workflows[this.state.type].requiredAttachments &&
      Workflows[this.state.type].requiredAttachments.project &&
      Workflows[this.state.type].requiredAttachments.project.length
    ) {
      const reqAttachments =
        Workflows[this.state.type].requiredAttachments.project;
      if (!attachments || !reqAttachments.every((el) => el in attachments)) {
        // ['this', 'that', 'other'] => '"this", "that" and "other"'
        const reqAttachmentsStr = reqAttachments
          .map((el) => `"${el}"`)
          .join(', ')
          .replace(/(, )(?!.* )/, ' and ');
        this.setState({
          _error: `The project requires file${
            reqAttachments.length === 1 ? '' : 's'
          } ${reqAttachmentsStr}`,
        });
        return;
      }
    }

    this.props.onSave(project, attachments);
  }

  cancel() {
    this.props.onCancel();
  }

  render() {
    const childComponent = this.state.type
      ? Workflows[this.state.type].components.NewProject
      : null;
    const workflowAddOn = childComponent
      ? React.createElement(childComponent, {
          owner: () => this.container,
          parentProps: this.props,
        })
      : null;

    return (
      <ItemEditor
        error={this.state._error || this.props.error}
        ref={(c) => {
          this.container = c;
        }}
        title="New Project"
        actions={[
          { name: 'cancel', label: 'Cancel' },
          { name: 'newProject', label: 'Create project' },
        ]}
        onAction={this.onAction}
      >
        <section className={style.group}>
          <label className={style.label}> Type </label>
          <select
            className={style.input}
            data-name="type"
            onChange={this.updateForm}
            value={this.state.type}
          >
            {this.props.workflowNames.map((el, index) => (
              <option key={`${el.label}_${el.value}_${index}`} value={el.value}>
                {el.label}
              </option>
            ))}
          </select>
        </section>
        {workflowAddOn}
      </ItemEditor>
    );
  }
}

ProjectNew.propTypes = {
  workflowNames: PropTypes.array.isRequired,
  error: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default withRouter(
  connect(
    (state, props) => {
      return {
        workflowNames: state.projects.workflowNames,
        error: getNetworkError(state, 'save_project'),
        onCancel: () => props.history.replace('/'),
      };
    },
    () => {
      return {
        onSave: (project, attachments) =>
          dispatch(Actions.saveProject(project, attachments)),
      };
    }
  )(ProjectNew)
);
