import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';

import style from 'HPCCloudStyle/PageWithMenu.mcss';

import Workflows from '../../../workflows';
import tools from '../../../tools';
import LoadingPanel from '../../../panels/LoadingPanel';
import Toolbar from '../../../panels/Toolbar';
import { projectFunctions } from '../../../utils/AccessHelper';
import { primaryBreadCrumbs } from '../../../utils/Constants';

import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/taskflows';
import { fetchClusters } from '../../../redux/actions/clusters';
import { fetchVolumes } from '../../../redux/actions/volumes';

class SimulationView extends React.Component {
  componentDidMount() {
    if (this.props.simulation) {
      this.props.onMount(this.props.simulation);
      this.props.fetchClusters();
      this.props.fetchVolumes();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      !this.props.simulation &&
      nextProps.simulation &&
      Object.keys(nextProps.simulation.steps).length
    ) {
      this.props.onMount(nextProps.simulation);
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.simulation) {
      this.props.fetchClusters();
      this.props.fetchVolumes();
    }
  }

  render() {
    if (!this.props.simulation || !this.props.project) {
      return <LoadingPanel />;
    }
    const { project, simulation, user, location } = this.props;
    const wfModule = Workflows[project.type];
    const query = queryString.parse(location.search);
    const step =
      this.props.match.params.step ||
      simulation.active ||
      wfModule.steps._order[0];
    const taskFlowName =
      wfModule.taskFlows && wfModule.taskFlows[step]
        ? wfModule.taskFlows[step]
        : null;
    const primaryJob =
      wfModule.taskFlows && wfModule.primaryJobs[step]
        ? wfModule.primaryJobs[step]
        : null;
    const viewName =
      query.view || this.props.simulation.steps[step].view || 'default';
    const ChildComponent = tools[viewName]
      ? tools[viewName].view
      : wfModule.components.ViewSimulation;
    const childProvidesToolbar = tools[viewName]
      ? tools[viewName].providesToolbar
      : false;

    if (ChildComponent) {
      return (
        <div className={style.rootContainer}>
          <Toolbar
            hidden={childProvidesToolbar}
            breadcrumb={primaryBreadCrumbs(
              this.props.project._id,
              this.props.simulation._id
            )}
            title={
              <span>
                {' '}
                <img
                  alt={this.props.project.type}
                  src={projectFunctions.getIcon(this.props.project).image}
                  height="20px"
                />
                &nbsp;{this.props.project.name} / {this.props.simulation.name}
              </span>
            }
          />
          <ChildComponent
            project={project}
            simulation={simulation}
            step={step}
            view={viewName}
            taskFlowName={taskFlowName}
            primaryJob={primaryJob}
            location={this.props.location}
            module={wfModule}
            user={user}
          />
        </div>
      );
    }

    return (
      <center>No simulation view for simulation of type {project.type}.</center>
    );
  }
}

SimulationView.propTypes = {
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,

  simulation: PropTypes.object,
  project: PropTypes.object,
  onMount: PropTypes.func.isRequired,
  fetchClusters: PropTypes.func.isRequired,
  fetchVolumes: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

SimulationView.defaultProps = {
  project: null,
  simulation: null,
};

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default withRouter(
  connect(
    (state) => {
      const project = state.projects.mapById[state.projects.active];
      const simulations = state.projects.simulations[state.projects.active];
      const simulation = simulations
        ? state.simulations.mapById[simulations.active]
        : null;

      return {
        project,
        simulation,
        user: state.auth.user,
      };
    },
    () => {
      return {
        onMount: (simulation) =>
          dispatch(Actions.updateTaskflowFromSimulation(simulation)),
        fetchClusters: () => dispatch(fetchClusters()),
        fetchVolumes: () => dispatch(fetchVolumes()),
      };
    }
  )(SimulationView)
);
