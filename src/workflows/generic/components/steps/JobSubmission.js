import React                   from 'react';
import ButtonBar               from '../../../../panels/ButtonBar';
import defaultServerParameters from '../../../../panels/run/defaults';
import RunClusterFrom          from '../../../../panels/run';
import getClusterPayload       from '../../../../utils/ClusterPayload';

function getServerProfiles(state) {
  const profiles = {};
  ['EC2', 'Traditional'].forEach(name => {
    profiles[name] = state[name];
  });
  return profiles;
}

export default class JobSubmission extends React.Component {
  constructor(props) {
    super(props);

    // Manually bind this method to the component instance...
    this.dataChange = this.dataChange.bind(this);
    this.buttonAction = this.buttonAction.bind(this);
    this.updateServerType = this.updateServerType.bind(this);
    this.prepareJob = this.prepareJob.bind(this);

    // Manage internal state
    this.state = Object.assign({ serverType: 'Traditional' }, defaultServerParameters);
  }

  dataChange(key, value, which) {
    var profile = this.state[which];
    profile[key] = value;
    this.setState({ [which]: profile });
  }

  buttonAction(action) {
    const fn = this.props.actionFunctions[action] || this[action];
    if (fn) {
      fn(this.props);
    } else {
      console.error('Could not find action', action, 'from', this.props.actionFunctions, 'or', this);
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
    try {
      const cluster = getClusterPayload(this.state.serverType, clusterSettings);
      if (!cluster) {
        throw Error(`Unrecognized serverType: ${this.state.serverType}`);
      }
      Object.assign(payload, clusterSettings.runtime, { cluster });
    } catch (error) {
      this.props.onError(error.message);
      return;
    }

    this.props.onJobSubmition(
      this.props.taskFlowName,
      this.props.primaryJob,
      payload,
      simulationStep,
      { // new location
        pathname: this.props.location.pathname,
        query: Object.assign({}, this.props.location.query, { view: this.props.nextView }),
        state: this.props.location.state,
      });
  }

  render() {
    // Add add-on UI if provided
    const workflowAddOn = this.props.addOn
      ? React.createElement(this.props.addOn, { owner: () => this, parentProps: this.props, parentState: this.state })
      : null;

    return (
      <div>
        <RunClusterFrom
          serverType={this.state.serverType}
          serverTypeChange={this.updateServerType}
          profiles={getServerProfiles(this.state)}
          dataChange={this.dataChange}
          clusterFilter={this.clusterFilter}
        />
        { workflowAddOn }
        <ButtonBar
          visible={this.state[this.state.serverType].profile !== ''}
          onAction={this.buttonAction}
          actions={this.props.actionList}
          error={ this.props.error }
        />
      </div>);
  }
}

JobSubmission.propTypes = {
  actionList: React.PropTypes.array,
  actionFunctions: React.PropTypes.object,
  clusterFilter: React.PropTypes.func,
  getPayload: React.PropTypes.func,
  getTaskflowMetaData: React.PropTypes.func,
  getSimulationStep: React.PropTypes.func,
  nextView: React.PropTypes.string,

  addOn: React.PropTypes.func,
  primaryJob: React.PropTypes.string,
  location: React.PropTypes.object,
  project: React.PropTypes.object,
  simulation: React.PropTypes.object,
  step: React.PropTypes.string,
  taskFlowName: React.PropTypes.string,
  view: React.PropTypes.string,
  error: React.PropTypes.string,
  clusters: React.PropTypes.object,

  onJobSubmition: React.PropTypes.func,
  onError: React.PropTypes.func,
};

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
};
