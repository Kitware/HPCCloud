import ItemEditor   from '../../../panels/ItemEditor';
import React        from 'react';

import Workflows    from '../../../workflows';
import getNetworkError from '../../../utils/getNetworkError';
import get          from '../../../utils/get';

import breadCrumbStyle from 'HPCCloudStyle/Theme.mcss';

import { connect }  from 'react-redux';
import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/projects';
import * as Router  from '../../../redux/actions/router';

function getActions(disabled) {
  return [
    { name: 'cancel', label: 'Cancel', disabled },
    { name: 'newSimulation', label: 'Create simulation', disabled },
  ];
}

const SimulationNew = React.createClass({

  displayName: 'Simulation/New',

  propTypes: {
    params: React.PropTypes.object,
    error: React.PropTypes.string,
    project: React.PropTypes.object,
    buttonsDisabled: React.PropTypes.bool,
    onSave: React.PropTypes.func,
    onCancel: React.PropTypes.func,
  },

  getInitialState() {
    return {
      _error: null,
    };
  },

  onAction(action, data, attachments) {
    this[action](data, attachments);
  },

  newSimulation(data, attachments) {
    const { name, description } = data,
      projectId = this.props.params.projectId,
      metadata = {},
      stepsInfo = Workflows[this.props.project.type].steps,
      steps = stepsInfo._initial_state,
      disabled = stepsInfo._disabled || [],
      active = stepsInfo._active || stepsInfo._order[0],
      simulation = { name, description, steps, metadata, projectId, active, disabled };

    // simulation name is always required.
    if (!name || !name.length) {
      this.setState({ _error: 'The simulation needs to have a name' });
      return;
    }

    // check for requiredAttachments.
    if (get(Workflows[this.props.project.type], 'requiredAttachments.simulation.length')) {
      const reqAttachments = Workflows[this.props.project.type].requiredAttachments.simulation;
      if (!attachments || !reqAttachments.every((el) => attachments.hasOwnProperty(el))) {
        // ['this', 'that', 'other'] => '"this", "that" and "other"'
        const reqAttachmentsStr = reqAttachments.map((el) => `"${el}"`).join(', ').replace(/(, )(?!.* )/, ' and ');
        this.setState({ _error: `The simulation requires file${reqAttachments.length === 1 ? '' : 's'} ${reqAttachmentsStr}` });
        return;
      }
    }

    this.props.onSave(simulation, attachments);
  },

  cancel() {
    this.props.onCancel(`/View/Project/${this.props.params.projectId}`);
  },

  render() {
    if (!this.props.project) {
      return null;
    }

    const type = this.props.project.type;
    const childComponent = type ? Workflows[type].components.NewSimulation : null;
    const workflowAddOn = childComponent ? React.createElement(childComponent, { owner: () => this.container,
      parentProps: this.props }) : null;

    return (
      <ItemEditor
        breadcrumb={{
          paths: ['/', `/View/Project/${this.props.project._id}`],
          icons: [
            breadCrumbStyle.breadCrumbRootIcon,
            breadCrumbStyle.breadCrumbProjectIcon,
          ],
        }}
        error={ this.state._error || this.props.error }
        ref={(c) => {this.container = c;}}
        title="New Simulation"
        actions={ getActions(this.props.buttonsDisabled) }
        onAction={ this.onAction }
      >
      { workflowAddOn }
      </ItemEditor>);
  },
});

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state, props) => {
    return {
      project: state.projects.mapById[state.projects.active || props.params.id],
      buttonsDisabled: !!get(state, 'network.pending.save_simulation'),
      error: getNetworkError(state, 'save_simulation'),
    };
  },
  () => {
    return {
      onSave: (simulation, attachments) => dispatch(Actions.saveSimulation(simulation, attachments, `/View/Project/${simulation.projectId}`)),
      onCancel: (location) => dispatch(Router.replace(location)),
    };
  }
)(SimulationNew);

