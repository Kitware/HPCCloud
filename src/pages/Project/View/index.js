import React                from 'react';
import { SimulationHelper } from '../../../utils/AccessHelper';
import TableListing         from '../../../panels/TableListing';

import breadCrumbStyle      from 'HPCCloudStyle/Theme.mcss';

import { connect }  from 'react-redux';
import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/projects';
import * as Router  from '../../../redux/actions/router';

const ProjectView = React.createClass({

  displayName: 'Project/View',

  propTypes: {
    location: React.PropTypes.object,
    params: React.PropTypes.object,
    error: React.PropTypes.string,
    project: React.PropTypes.object,
    simulations: React.PropTypes.array,
    onActivate: React.PropTypes.func,
    onLocationChange: React.PropTypes.func,
    onDelete: React.PropTypes.func,
  },

  onAction(action, arg) {
    this[action](arg);
  },

  addItem() {
    this.props.onLocationChange(`/New/Simulation/${this.props.params.id}`);
  },

  deleteItems(items) {
    /* eslint-disable no-alert */
    if (items.some(sim => sim.metadata.status === 'running')) {
      alert('You cannot delete a running simulation, terminate it and try again.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${items.length === 1 ? 'this' : 'these'} ${items.length} simulation${items.length === 1 ? '' : 's'}?`)) {
      return;
    }
    items.forEach(item => this.props.onDelete(item));
  },

  edit(id) {
    this.props.onLocationChange(`/Edit/Simulation/${id}`);
  },

  click({ id, location }) {
    this.props.onActivate(id, location);
  },

  render() {
    return (
      <TableListing
        breadcrumb={{
          paths: ['/', `/View/Project/${this.props.params.id}`],
          icons: [
            breadCrumbStyle.breadCrumbRootIcon,
            breadCrumbStyle.breadCrumbProjectIcon,
          ] }}
        location={ this.props.location }
        accessHelper={ SimulationHelper }
        items={ this.props.simulations }
        onAction={ this.onAction }
        title={ `${this.props.project.name} / Simulations` }
      />);
  },
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state, props) => {
    const project = state.projects.mapById[state.projects.active || props.params.id];
    if (!project) {
      return { project: { name: 'No project found' }, simulations: [], error: 'No project found' };
    }
    const projectSims = state.projects.simulations[project._id];
    const simulations = projectSims ? projectSims.list.map(id => state.simulations.mapById[id]).filter(i => !!i) : [];
    return {
      project,
      simulations,
      error: null, // NO ERROR... get(state, 'network.error.save_project.resp.data.message'),
    };
  },
  () => {
    return {
      onActivate: (id, location) => dispatch(Actions.setActiveSimulation(id, location)),
      onLocationChange: location => dispatch(Router.push(location)),
      onDelete: (simulation) => dispatch(Actions.deleteSimulation(simulation)),
    };
  }
)(ProjectView);

