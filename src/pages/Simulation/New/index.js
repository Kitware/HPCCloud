import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import breadCrumbStyle from 'HPCCloudStyle/Theme.mcss';

import ItemEditor from '../../../panels/ItemEditor';

import Workflows from '../../../workflows';
import getNetworkError from '../../../utils/getNetworkError';
import get from '../../../utils/get';

import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/projects';
import * as Router from '../../../redux/actions/router';

function getActions(disabled) {
  return [
    { name: 'cancel', label: 'Cancel', disabled },
    { name: 'newSimulation', label: 'Create simulation', disabled },
  ];
}

class SimulationNew extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      _error: null,
    };
    this.onAction = this.onAction.bind(this);
  }

  onAction(action, data, attachments) {
    this[action](data, attachments);
  }

  newSimulation(data, attachments) {
    const { name, description } = data;
    const projectId = this.props.params.projectId;
    const metadata = {};
    const stepsInfo = Workflows[this.props.project.type].steps;
    const steps = stepsInfo._initial_state;
    const disabled = stepsInfo._disabled || [];
    const active = stepsInfo._active || stepsInfo._order[0];
    const simulation = {
      name,
      description,
      steps,
      metadata,
      projectId,
      active,
      disabled,
    };

    // simulation name is always required.
    if (!name || !name.length) {
      this.setState({ _error: 'The simulation needs to have a name' });
      return;
    }

    // check for requiredAttachments.
    if (
      get(
        Workflows[this.props.project.type],
        'requiredAttachments.simulation.length'
      )
    ) {
      const reqAttachments =
        Workflows[this.props.project.type].requiredAttachments.simulation;
      if (!attachments || !reqAttachments.every((el) => el in attachments)) {
        // ['this', 'that', 'other'] => '"this", "that" and "other"'
        const reqAttachmentsStr = reqAttachments
          .map((el) => `"${el}"`)
          .join(', ')
          .replace(/(, )(?!.* )/, ' and ');
        this.setState({
          _error: `The simulation requires file${
            reqAttachments.length === 1 ? '' : 's'
          } ${reqAttachmentsStr}`,
        });
        return;
      }
    }

    this.props.onSave(simulation, attachments);
  }

  cancel() {
    this.props.onCancel(`/View/Project/${this.props.params.projectId}`);
  }

  render() {
    if (!this.props.project) {
      return null;
    }

    const type = this.props.project.type;
    const childComponent = type
      ? Workflows[type].components.NewSimulation
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
          paths: ['/', `/View/Project/${this.props.project._id}`],
          icons: [
            breadCrumbStyle.breadCrumbRootIcon,
            breadCrumbStyle.breadCrumbProjectIcon,
          ],
        }}
        error={this.state._error || this.props.error}
        ref={(c) => {
          this.container = c;
        }}
        title="New Simulation"
        actions={getActions(this.props.buttonsDisabled)}
        onAction={this.onAction}
      >
        {workflowAddOn}
      </ItemEditor>
    );
  }
}

SimulationNew.propTypes = {
  params: PropTypes.object.isRequired,
  error: PropTypes.string.isRequired,
  project: PropTypes.object.isRequired,
  buttonsDisabled: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state, props) => {
    return {
      project: state.projects.mapById[props.params.projectId],
      buttonsDisabled: !!get(state, 'network.pending.save_simulation'),
      error: getNetworkError(state, 'save_simulation'),
    };
  },
  () => {
    return {
      onSave: (simulation, attachments) =>
        dispatch(
          Actions.saveSimulation(
            simulation,
            attachments,
            `/View/Project/${simulation.projectId}`
          )
        ),
      onCancel: (location) => dispatch(Router.replace(location)),
    };
  }
)(SimulationNew);
