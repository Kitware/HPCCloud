import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import theme from 'HPCCloudStyle/Theme.mcss';

import {
  projectFunctions,
  SimulationHelper,
  userHasAccess,
} from '../../../utils/AccessHelper';
import TableListing from '../../../panels/TableListing';
import EmptyPlaceholder from '../../../panels/EmptyPlaceholder';
import { primaryBreadCrumbs } from '../../../utils/Constants';

import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/projects';
import * as Router from '../../../redux/actions/router';

class ProjectView extends React.Component {
  constructor(props) {
    super(props);
    this.onAction = this.onAction.bind(this);
  }

  onAction(action, arg) {
    this[action](arg);
  }

  addItem() {
    this.props.onLocationChange(`/New/Simulation/${this.props.params.id}`);
  }

  deleteItems(items) {
    /* eslint-disable no-alert */
    /* eslint-disable no-restricted-globals */
    if (items.some((sim) => sim.metadata.status === 'running')) {
      alert(
        'You cannot delete a running simulation, terminate it and try again.'
      );
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${
          items.length === 1 ? 'this' : 'these'
        } ${items.length} simulation${items.length === 1 ? '' : 's'}?`
      )
    ) {
      return;
    }
    items.forEach((item) => this.props.onDelete(item));
  }

  edit(id) {
    this.props.onLocationChange(`/Edit/Simulation/${id}`);
  }

  click({ id, location }) {
    this.props.onActivate(id, location);
  }

  render() {
    return (
      <TableListing
        breadcrumb={primaryBreadCrumbs(this.props.params.id)}
        location={this.props.location}
        accessHelper={SimulationHelper}
        items={this.props.simulations}
        onAction={this.onAction}
        hasAccess={this.props.hasAccess}
        title={
          <span>
            {' '}
            <img
              alt={this.props.project.type}
              src={projectFunctions.getIcon(this.props.project).image}
              height="20px"
            />{' '}
            {this.props.project.name} / Simulations
          </span>
        }
        placeholder={
          <EmptyPlaceholder
            phrase={
              <span>
                There are no simulations for this project<br />
                You can add some with the <i className={theme.addIcon} /> above.
              </span>
            }
          />
        }
      />
    );
  }
}

ProjectView.propTypes = {
  // FIXME ROUTER LOCATION HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // FIXME ROUTER LOCATION HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // FIXME ROUTER LOCATION HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  // FIXME ROUTER LOCATION HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // FIXME ROUTER LOCATION HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // FIXME ROUTER LOCATION HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  project: PropTypes.object.isRequired,
  simulations: PropTypes.array.isRequired,
  onActivate: PropTypes.func.isRequired,
  onLocationChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  hasAccess: PropTypes.bool.isRequired,
};

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state, props) => {
    const project =
      state.projects.mapById[state.projects.active || props.params.id];
    if (!project) {
      return {
        project: { name: 'No project found' },
        simulations: [],
        error: 'No project found',
      };
    }
    const projectSims = state.projects.simulations[project._id];
    const simulations = projectSims
      ? projectSims.list
          .map((id) => state.simulations.mapById[id])
          .filter((i) => !!i)
      : [];
    return {
      hasAccess: userHasAccess(state.auth.user, project.access, 'write'),
      project,
      simulations,
    };
  },
  () => {
    return {
      onActivate: (id, location) =>
        dispatch(Actions.setActiveSimulation(id, location)),
      // FIXME ROUTER LOCATION HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // FIXME ROUTER LOCATION HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // FIXME ROUTER LOCATION HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      onLocationChange: (location) => dispatch(Router.push(location)),
      // FIXME ROUTER LOCATION HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // FIXME ROUTER LOCATION HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // FIXME ROUTER LOCATION HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      onDelete: (simulation) => dispatch(Actions.deleteSimulation(simulation)),
    };
  }
)(ProjectView);
