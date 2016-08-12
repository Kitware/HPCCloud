import React     from 'react';
import Workflows from '../../../workflows';
import tools     from  '../../../tools';
import LoadingPanel from '../../../panels/LoadingPanel';
import Toolbar      from '../../../panels/Toolbar';
import { projectFunctions } from '../../../utils/AccessHelper';
import { primaryBreadCrumbs } from '../../../utils/Constants';

import style            from 'HPCCloudStyle/PageWithMenu.mcss';

import { connect } from 'react-redux';
import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/taskflows';
import { fetchClusters } from '../../../redux/actions/clusters';

const SimulationView = React.createClass({

  displayName: 'Simulation/View',

  propTypes: {
    location: React.PropTypes.object,
    params: React.PropTypes.object,
    simulation: React.PropTypes.object,
    project: React.PropTypes.object,
    onMount: React.PropTypes.func,
    fetchClusters: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      project: null,
      simulation: null,
    };
  },

  componentDidMount() {
    if (this.props.simulation) {
      this.props.onMount(this.props.simulation);
    }
  },

  componentWillReceiveProps(nextProps) {
    if (!this.props.simulation && nextProps.simulation && Object.keys(nextProps.simulation.steps).length) {
      this.props.onMount(nextProps.simulation);
    }
  },

  componentDidUpdate(prevProps) {
    if (!prevProps.simulation) {
      this.props.fetchClusters();
    }
  },

  render() {
    if (!this.props.simulation || !this.props.project) {
      return <LoadingPanel />;
    }

    const { project, simulation } = this.props;
    const wfModule = Workflows[project.type];
    const step = this.props.params.step || simulation.active || wfModule.steps._order[0];
    const taskFlowName = wfModule.taskFlows && wfModule.taskFlows[step] ? wfModule.taskFlows[step] : null;
    const primaryJob = wfModule.taskFlows && wfModule.primaryJobs[step] ? wfModule.primaryJobs[step] : null;
    const viewName = this.props.location.query.view || this.props.simulation.steps[step].view || 'default';
    const ChildComponent = tools[viewName] ? tools[viewName].view : wfModule.components.ViewSimulation;
    const childProvidesToolbar = tools[viewName] ? tools[viewName].providesToolbar : false;

    if (ChildComponent) {
      return (
        <div className={ style.rootContainer }>
          <Toolbar hidden={childProvidesToolbar}
            breadcrumb={primaryBreadCrumbs(this.props.project._id, this.props.simulation._id)}
            title={ <span> <img src={projectFunctions.getIcon(this.props.project).image} height="20px" />
              &nbsp;{this.props.project.name} / {this.props.simulation.name}
              </span> }
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
          />
        </div>);
    }

    return <center>No simulation view for simulation of type {project.type}.</center>;
  },
});

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  state => {
    const project = state.projects.mapById[state.projects.active];
    const simulations = state.projects.simulations[state.projects.active];
    const simulation = simulations ? state.simulations.mapById[simulations.active] : null;

    return {
      project,
      simulation,
    };
  },
  () => {
    return {
      onMount: (simulation) => dispatch(Actions.updateTaskflowFromSimulation(simulation)),
      fetchClusters: () => dispatch(fetchClusters()),
    };
  }
)(SimulationView);
