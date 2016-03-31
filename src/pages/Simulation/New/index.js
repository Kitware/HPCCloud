import ItemEditor   from '../../../panels/ItemEditor';
import React        from 'react';

import Workflows    from '../../../workflows';

import breadCrumbStyle from 'HPCCloudStyle/Theme.mcss';

import { connect }  from 'react-redux';
import get          from 'mout/src/object/get';
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

  onAction(action, data, attachements) {
    this[action](data, attachements);
  },

  newSimulation(data, attachements) {
    const { name, description } = data,
      projectId = this.props.params.projectId,
      metadata = {},
      stepsInfo = Workflows[this.props.project.type].steps,
      steps = stepsInfo._initial_state,
      disabled = stepsInfo._disabled || [],
      active = stepsInfo._active || stepsInfo._order[0],
      simulation = { name, description, steps, metadata, projectId, active, disabled };

    if (name && name.length) {
      this.props.onSave(simulation, attachements);
    } else {
      this.setState({ _error: 'The simulation needs to have a name' });
    }
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
    const workflowAddOn = childComponent ? React.createElement(childComponent, { owner: () => this.refs.container }) : null;
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
        ref="container"
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
      error: get(state, 'network.error.save_simulation.resp.data.message'),
    };
  },
  () => {
    return {
      onSave: (simulation, attachements) => dispatch(Actions.saveSimulation(simulation, attachements, `/View/Project/${simulation.projectId}`)),
      onCancel: (location) => dispatch(Router.replace(location)),
    };
  }
)(SimulationNew);

