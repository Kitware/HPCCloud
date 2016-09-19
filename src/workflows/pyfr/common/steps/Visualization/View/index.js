import ButtonBar        from '../../../../../../panels/ButtonBar';
import FileListing      from '../../../../../../panels/FileListing';
import JobMonitor       from '../../../../../../panels/JobMonitor';
import merge            from 'mout/src/object/merge';
import React            from 'react';
import LoadingPanel     from '../../../../../../panels/LoadingPanel';

import get              from '../../../../../../utils/get';
import getNetworkError  from '../../../../../../utils/getNetworkError';
import { getActions, getDisabledButtons }  from '../../../../../../utils/getDisabledButtons';

import { connect }      from 'react-redux';
import { dispatch }     from '../../../../../../redux';
import * as Actions     from '../../../../../../redux/actions/taskflows';
import * as SimActions  from '../../../../../../redux/actions/projects';
import * as ClusterActions  from '../../../../../../redux/actions/clusters';

const VisualizationView = React.createClass({
  displayName: 'pyfr/common/steps/Visualization/View',

  propTypes: {
    location: React.PropTypes.object,
    project: React.PropTypes.object,
    simulation: React.PropTypes.object,
    step: React.PropTypes.string,
    taskFlowName: React.PropTypes.string,
    primaryJob: React.PropTypes.string,
    view: React.PropTypes.string,

    onTerminateTaskflow: React.PropTypes.func,
    onRerun: React.PropTypes.func,
    onVisualizeTaskflow: React.PropTypes.func,
    onTerminateInstance: React.PropTypes.func,

    taskflowId: React.PropTypes.string,
    taskflow: React.PropTypes.object,
    cluster: React.PropTypes.object,
    disabledButtons: React.PropTypes.object,
    error: React.PropTypes.string,
  },

  visualizeTaskflow() {
    const newSimState = Object.assign({}, this.props.simulation, { active: 'Visualization' });
    const location = {
      pathname: this.props.location.pathname,
      query: merge(this.props.location.query, { view: 'visualizer' }),
      state: this.props.location.state,
    };

    this.props.onVisualizeTaskflow(newSimState, location);
  },

  terminateInstance() {
    this.props.onTerminateInstance(this.props.taskflow.flow.meta.cluster._id);
  },

  terminateTaskflow() {
    this.props.onTerminateTaskflow(this.props.taskflowId);
  },

  rerun() {
    const stepData = { view: 'default', metadata: {} };
    const location = {
      pathname: this.props.location.pathname,
      query: { view: 'default' },
      state: this.props.location.state,
    };

    this.props.onRerun(this.props.simulation._id, this.props.step, stepData, location);
  },

  buttonBarAction(action) {
    this[action]();
  },

  render() {
    const { taskflow, taskflowId, error, simulation, cluster, disabledButtons } = this.props;

    // these can be undefined sometimes, show a loading icon if any are missing.
    if (!taskflow || !taskflow.flow ||
      !taskflow.jobMapById || !taskflow.actions || !taskflow.hasOwnProperty('allComplete')) {
      return <LoadingPanel />;
    }

    const jobs = Object.keys(taskflow.jobMapById).map(id => taskflow.jobMapById[id]);
    const actions = [];
    const fileActionsDisabled = cluster ? cluster.status !== 'running' : true;

    taskflow.actions.forEach(action => {
      actions.push(action);
    });

    // name is paraview and status is running -> visualize
    if (jobs.some(job => job.name === this.props.primaryJob && job.status === 'running')) {
      actions.push('visualize');
    } else if (taskflow.allComplete) {
      actions.push('rerun');
    }

    return (
      <div>
        <JobMonitor taskflowId={ taskflowId }
          clusterId={taskflow.flow.meta ? taskflow.flow.meta.cluster._id : null}
        />
        <FileListing title="Input Files" folderId={simulation.metadata.outputFolder._id}
          actionsDisbled={fileActionsDisabled} />
        <FileListing title="Output Files" folderId={simulation.steps.Visualization.folderId}
          actionsDisbled={fileActionsDisabled} />
        <section>
          <ButtonBar
            onAction={ this.buttonBarAction }
            actions={ getActions(actions, disabledButtons) }
            error={ error }
          />
        </section>
      </div>
    );
  },
});


// Binding --------------------------------------------------------------------

export default connect(
  (state, props) => {
    var taskflowId = null;
    const activeProject = state.projects.active;
    const activeSimulation = activeProject ? state.projects.simulations[activeProject].active : null;

    if (activeSimulation) {
      const simulation = state.simulations.mapById[activeSimulation];
      taskflowId = simulation.steps.Visualization.metadata.taskflowId;
    }

    let taskflow = null;
    if (taskflowId) {
      taskflow = state.taskflows.mapById[taskflowId];
    }

    let cluster = null;
    if (get(taskflow, 'flow.meta.cluster._id')) {
      const clusterId = taskflow.flow.meta.cluster._id;
      cluster = state.preferences.clusters.mapById[clusterId];
    }

    return {
      taskflowId, taskflow, cluster,
      disabledButtons: getDisabledButtons(state.network, taskflow),
      error: getNetworkError(state, ['terminate_taskflow', 'delete_taskflow']),
    };
  },
  () => ({
    onVisualizeTaskflow: (sim, location) => dispatch(SimActions.saveSimulation(sim, null, location)),
    onRerun: (id, stepName, stepData, location) => dispatch(SimActions.updateSimulationStep(id, stepName, stepData, location)),
    onTerminateTaskflow: (id) => dispatch(Actions.terminateTaskflow(id)),
    onTerminateInstance: (id) => dispatch(ClusterActions.terminateCluster(id)),
  })
)(VisualizationView);
