import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import values from 'mout/src/object/values';

import ButtonBar from '../../../../panels/ButtonBar';
import defaultServerParameters from '../../../../panels/run/defaults';
import RunClusterFrom from '../../../../panels/run';
import getClusterPayload from '../../../../utils/ClusterPayload';

import { dispatch } from '../../../../redux';
import * as Actions from '../../../../redux/actions/taskflows';
import * as NetActions from '../../../../redux/actions/network';

// ----------------------------------------------------------------------------

function getServerProfiles(state) {
  const profiles = {};
  ['EC2', 'Traditional'].forEach((name) => {
    profiles[name] = state[name];
  });
  return profiles;
}

// ----------------------------------------------------------------------------

function onJobSubmition(
  taskflowName,
  primaryJob,
  payload,
  simulationStep,
  location
) {
  dispatch(
    Actions.createTaskflow(
      taskflowName,
      primaryJob,
      payload,
      simulationStep,
      location
    )
  );
}

// ----------------------------------------------------------------------------

function onError(message) {
  dispatch(
    NetActions.errorNetworkCall(
      'create_taskflow',
      { data: { message } },
      'form'
    )
  );
}

// ----------------------------------------------------------------------------

export default class JobSubmission extends React.Component {
  constructor(props) {
    super(props);

    // Manually bind this method to the component instance...
    this.dataChange = this.dataChange.bind(this);
    this.buttonAction = this.buttonAction.bind(this);
    this.updateServerType = this.updateServerType.bind(this);
    this.prepareJob = this.prepareJob.bind(this);

    // Manage internal state
    this.state = Object.assign(
      { serverType: 'Traditional' },
      defaultServerParameters
    );
  }

  dataChange(key, value, which) {
    const profile = this.state[which];
    profile[key] = value;
    this.setState({ [which]: profile });
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

  updateServerType(e) {
    this.setState({ serverType: e.target.value });
  }

  prepareJob() {
    const payload = this.props.getPayload(this.props, this.state);
    const simulationStep = this.props.getSimulationStep(this.props, this.state);

    // Generic cluster management
    const clusterSettings = this.state[this.state.serverType];
    Object.assign(payload, clusterSettings.runtime);
    const clusterNames = values(this.props.clusters)
      .filter((el) => el.type === 'ec2')
      .map((el) => el.name);
    try {
      const cluster = getClusterPayload(
        this.state.serverType,
        clusterSettings,
        clusterNames
      );
      if (!cluster) {
        throw Error(`Unrecognized serverType: ${this.state.serverType}`);
      }
      Object.assign(payload, clusterSettings.runtime, { cluster });
    } catch (error) {
      this.props.onError(error.message);
      return;
    }

    if (this.state.serverType === 'EC2') {
      const volumeNames = values(this.props.volumes).map((el) => el.name);
      if (this.state.EC2.volume) {
        payload.volume = { _id: this.state.EC2.volume };
      } else if (this.state.EC2.volumeName && this.state.EC2.volumeSize) {
        const volumeSize = this.state.EC2.volumeSize;
        const volumeName = this.state.EC2.volumeName.trim();
        try {
          if (volumeNames.indexOf(volumeName) !== -1) {
            throw Error(
              `A volume with the name '${volumeName}' already exists`
            );
          } else if (volumeSize <= 0) {
            throw Error('Volume size must be greater than zero');
          }
          payload.volume = {
            name: volumeName,
            size: volumeSize,
          };
        } catch (error) {
          this.props.onError(error.message);
          return;
        }
      }
    }

    this.props.onJobSubmition(
      this.props.taskFlowName,
      this.props.primaryJob,
      payload,
      simulationStep,
      {
        // new location
        pathname: this.props.location.pathname,
        search: queryString.stringify(
          Object.assign({}, queryString.parse(this.props.location.search), {
            view: this.props.nextView,
          })
        ),
        state: this.props.location.state,
      }
    );
  }

  render() {
    // Add add-on UI if provided
    const workflowAddOn = this.props.addOn
      ? React.createElement(this.props.addOn, {
          owner: () => this,
          parentProps: this.props,
          parentState: this.state,
        })
      : null;

    return (
      <div>
        <RunClusterFrom
          serverType={this.state.serverType}
          serverTypeChange={this.updateServerType}
          profiles={getServerProfiles(this.state)}
          dataChange={this.dataChange}
          clusterFilter={this.props.clusterFilter}
        />
        {workflowAddOn}
        <ButtonBar
          visible={this.state[this.state.serverType].profile !== ''}
          onAction={this.buttonAction}
          actions={this.props.actionList}
          error={this.props.error}
        />
      </div>
    );
  }
}

/* eslint-disable react/no-unused-prop-types */
JobSubmission.propTypes = {
  actionList: PropTypes.array,
  actionFunctions: PropTypes.object,
  clusterFilter: PropTypes.func,
  getPayload: PropTypes.func,
  getTaskflowMetaData: PropTypes.func,
  getSimulationStep: PropTypes.func,
  nextView: PropTypes.string,

  addOn: PropTypes.func,
  primaryJob: PropTypes.string,
  location: PropTypes.object,
  project: PropTypes.object,
  simulation: PropTypes.object,
  step: PropTypes.string,
  taskFlowName: PropTypes.string,
  view: PropTypes.string,
  error: PropTypes.string,
  clusters: PropTypes.object,
  volumes: PropTypes.object,

  onJobSubmition: PropTypes.func,
  onError: PropTypes.func,
};
/* eslint-enable react/no-unused-prop-types */

JobSubmission.defaultProps = {
  actionList: [{ name: 'prepareJob', label: 'Run Job', icon: '' }],
  actionFunctions: {},
  clusterFilter: () => true,
  nextView: 'run',

  getPayload: (props, state) => ({
    input: {
      folder: {
        id: props.simulation.metadata.inputFolder._id,
      },
    },
    output: {
      folder: {
        id: props.simulation.metadata.outputFolder._id,
      },
    },
  }),
  getTaskflowMetaData: (props, state) => ({}),
  getSimulationStep: (props, state) => ({
    id: props.simulation._id,
    name: props.simulation.name,
    step: props.step,
    data: {
      view: props.nextView,
      metadata: props.getTaskflowMetaData(props, state),
    },
  }),
  onJobSubmition,
  onError,

  addOn: undefined,
  primaryJob: undefined,
  location: undefined,
  project: undefined,
  simulation: undefined,
  step: undefined,
  taskFlowName: undefined,
  view: undefined,
  error: undefined,
  clusters: undefined,
  volumes: undefined,
};
