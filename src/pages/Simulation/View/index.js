import React     from 'react';
import Workflows from '../../../workflows';
import tools     from  '../../../tools';
import LoadingPanel from '../../../panels/LoadingPanel';

import { connect } from 'react-redux';
import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/taskflows';

const SimulationView = React.createClass({

  displayName: 'Simulation/View',

  propTypes: {
    location: React.PropTypes.object,
    params: React.PropTypes.object,
    simulation: React.PropTypes.object,
    project: React.PropTypes.object,
    onMount: React.PropTypes.func,
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

  render() {
    if (!this.props.simulation || !this.props.project) {
      return <LoadingPanel />;
    }

    const { project, simulation } = this.props;
    const wfModule = Workflows[project.type];
    const step = this.props.params.step || simulation.active || wfModule.steps._order[0];
    const taskFlowName = wfModule.taskFlows && wfModule.taskFlows[step] ? wfModule.taskFlows[step] : null;
    const primaryJob = wfModule.taskFlows && wfModule.primaryJobs[step] ? wfModule.primaryJobs[step] : null;
    const view = this.props.location.query.view || this.props.simulation.steps[step].view || 'default';
    const ChildComponent = tools[view] || wfModule.components.ViewSimulation;

    if (ChildComponent) {
      return (
        <ChildComponent
          project={project}
          simulation={simulation}
          step={step}
          view={view}
          taskFlowName={taskFlowName}
          primaryJob={primaryJob}
          location={this.props.location}
          module={wfModule}
        />);
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
    };
  }
)(SimulationView);

