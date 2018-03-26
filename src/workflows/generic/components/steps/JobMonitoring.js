import React from 'react';
import PropTypes from 'prop-types';

import ButtonBar from '../../../../panels/ButtonBar';
import JobMonitor from '../../../../panels/JobMonitor';
import FileListing from '../../../../panels/FileListing';
import LoadingPanel from '../../../../panels/LoadingPanel';

import get from '../../../../utils/get';
import { getActions } from '../../../../utils/getDisabledButtons';

import { dispatch } from '../../../../redux';
import * as Actions from '../../../../redux/actions/taskflows';
import * as ClusterActions from '../../../../redux/actions/clusters';
import * as SimActions from '../../../../redux/actions/projects';

// ----------------------------------------------------------------------------

function onTerminate(id) {
  dispatch(Actions.terminateTaskflow(id));
}

// ----------------------------------------------------------------------------

function onTerminateInstance(id) {
  dispatch(ClusterActions.terminateCluster(id));
}

// ----------------------------------------------------------------------------

export function onRerun(props) {
  const stepData = {
    view: 'default',
    metadata: Object.assign({}, props.simulation.steps[props.step].metadata),
  };
  // we want to preserve some metadata objects
  delete stepData.metadata.taskflowId;
  delete stepData.metadata.sessionKey;
  const location = {
    pathname: props.location.pathname,
    query: { view: 'default' },
    state: props.location.state,
  };
  dispatch(
    SimActions.updateSimulationStep(
      props.simulation._id,
      props.step,
      stepData,
      location
    )
  );
}

// ----------------------------------------------------------------------------

export default class JobMonitoring extends React.Component {
  constructor(props) {
    super(props);

    // Manually bind this method to the component instance...
    this.buttonAction = this.buttonAction.bind(this);
    this.onRerun = this.onRerun.bind(this);
    this.onTerminateInstance = this.onTerminateInstance.bind(this);
    this.onTerminate = this.onTerminate.bind(this);

    // Manage internal state
    this.state = {};
  }

  onRerun() {
    this.props.onRerun(this.props);
  }

  onTerminateInstance() {
    this.props.onTerminateInstance(this.props.taskflow.flow.meta.cluster._id);
  }

  onTerminate() {
    this.props.onTerminate(this.props.taskflowId);
  }

  buttonAction(action) {
    const fn = this.props.actionFunctions[action] || this[action];
    if (fn) {
      fn(this.props);
    } else {
      console.error(
        'Could not find action',
        action,
        'from',
        this.props.actionFunctions,
        'or',
        this
      );
    }
  }

  render() {
    if (!this.props.taskflow || !this.props.taskflow.flow) {
      return <LoadingPanel />;
    }

    const {
      taskflow,
      taskflowId,
      cluster,
      error,
      simulation,
      disabledButtons,
    } = this.props;
    const fileActionsDisabled = cluster ? cluster.status !== 'running' : true;
    const actions = this.props.getActions(this.props);

    return (
      <div>
        <JobMonitor
          taskflowId={taskflowId}
          clusterId={
            get(taskflow, 'flow.meta.cluster._id')
              ? taskflow.flow.meta.cluster._id
              : null
          }
        />
        <FileListing
          title="Input Files"
          folderId={simulation.metadata.inputFolder._id}
          actionsDisabled={fileActionsDisabled}
        />
        <FileListing
          title="Output Files"
          folderId={simulation.metadata.outputFolder._id}
          actionsDisabled={fileActionsDisabled}
        />
        <section>
          <ButtonBar
            onAction={this.buttonAction}
            actions={getActions(actions, disabledButtons)}
            error={error}
          />
        </section>
      </div>
    );
  }
}

/* eslint-disable react/no-unused-prop-types */

JobMonitoring.propTypes = {
  getActions: PropTypes.func,
  actionFunctions: PropTypes.object, // onDeleteCluster, onVisualize, onRerun

  location: PropTypes.object,
  project: PropTypes.object,
  simulation: PropTypes.object,
  step: PropTypes.string,
  taskFlowName: PropTypes.string,
  primaryJob: PropTypes.string,
  view: PropTypes.string,

  onRerun: PropTypes.func,
  onTerminate: PropTypes.func,
  onTerminateInstance: PropTypes.func,

  taskflowId: PropTypes.string,
  taskflow: PropTypes.object,
  cluster: PropTypes.object,
  disabledButtons: PropTypes.object,
  error: PropTypes.string,
};

JobMonitoring.defaultProps = {
  actionFunctions: {},
  getActions: (props) => {},
  onRerun,
  onTerminate,
  onTerminateInstance,

  location: undefined,
  project: undefined,
  simulation: undefined,
  step: undefined,
  taskFlowName: undefined,
  primaryJob: undefined,
  view: undefined,

  taskflowId: undefined,
  taskflow: undefined,
  cluster: undefined,
  disabledButtons: undefined,
  error: undefined,
};
