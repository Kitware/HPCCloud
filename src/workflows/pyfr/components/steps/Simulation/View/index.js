import React            from 'react';
import ButtonBar        from '../../../../../../panels/ButtonBar';
import JobMonitor       from '../../../../../../panels/JobMonitor';
import FileListing      from '../../../../../../panels/FileListing';
import LoadingPanel     from '../../../../../../panels/LoadingPanel';
import merge            from 'mout/src/object/merge';
import deepClone        from 'mout/src/lang/deepClone';

import get              from '../../../../../../utils/get';
import getNetworkError  from '../../../../../../utils/getNetworkError';
import { getActions, getDisabledButtons }  from '../../../../../../utils/getDisabledButtons';

import { connect }      from 'react-redux';
import { dispatch }     from '../../../../../../redux';
import * as Actions     from '../../../../../../redux/actions/taskflows';
import * as SimActions  from '../../../../../../redux/actions/projects';
import * as ClusterActions  from '../../../../../../redux/actions/clusters';

const SimualtionView = React.createClass({
  displayName: 'pyfr/common/steps/Simulation/View',

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
    onMount: React.PropTypes.func,

    taskflowId: React.PropTypes.string,
    taskflow: React.PropTypes.object,
    cluster: React.PropTypes.object,
    disabledButtons: React.PropTypes.object,
    error: React.PropTypes.string,
  },

  onAction(action) {
    this[action]();
  },

  visualizeTaskflow() {
    const location = {
      pathname: `View/Simulation/${this.props.simulation._id}/Visualization`,
      query: merge(this.props.location.query, { view: 'default' }),
      state: this.props.location.state,
    };
    const newSimState = deepClone(this.props.simulation);
    newSimState.steps.Visualization.metadata.dataDir = this.props.taskflow.outputDirectory;
    newSimState.steps.Visualization.metadata.fileName = this.props.taskflow.flow.meta.vtuFile;
    newSimState.active = 'Visualization';
    newSimState.disabled = newSimState.disabled.filter(step => step !== 'Visualization');

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

  render() {
    if (!this.props.taskflow || !this.props.taskflow.flow) {
      return <LoadingPanel />;
    }

    const { taskflow, taskflowId, cluster, error, simulation, disabledButtons } = this.props;
    const actions = [].concat(taskflow.actions ? taskflow.actions : []);
    const fileActionsDisabled = cluster ? cluster.status !== 'running' : true;

    if (taskflow.allComplete) {
      actions.push('visualize');
    }

    return (
      <div>
        <JobMonitor taskflowId={ taskflowId }
          clusterId={get(taskflow, 'flow.meta.cluster._id') ? taskflow.flow.meta.cluster._id : null}
        />
        <FileListing title="Input Files" folderId={simulation.metadata.inputFolder._id} actionsDisabled={fileActionsDisabled} />
        <FileListing title="Output Files" folderId={simulation.metadata.outputFolder._id} actionsDisabled={fileActionsDisabled} />
        <section>
            <ButtonBar
              onAction={ this.onAction }
              actions={ getActions(actions, disabledButtons) }
              error={ error}
            />
        </section>
      </div>);
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
      taskflowId = simulation.steps.Simulation.metadata.taskflowId;
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
      taskflowId, cluster, taskflow,
      disabledButtons: getDisabledButtons(state.network, taskflow),
      error: getNetworkError(state, ['terminate_taskflow', 'delete_taskflow']),
    };
  },
  () => ({
    onVisualizeTaskflow: (sim, location) => {
      dispatch(SimActions.saveSimulation(sim, null, location));
    },
    onRerun: (id, stepName, stepData, location) => dispatch(SimActions.updateSimulationStep(id, stepName, stepData, location)),
    onTerminateTaskflow: (id) => dispatch(Actions.terminateTaskflow(id)),
    onTerminateInstance: (id) => dispatch(ClusterActions.terminateCluster(id)),
  })
)(SimualtionView);

