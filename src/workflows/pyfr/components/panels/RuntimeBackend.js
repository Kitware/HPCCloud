import React from 'react';
import PropTypes from 'prop-types';

import formStyle from 'HPCCloudStyle/ItemEditor.mcss';

import get from '../../../../utils/get';

const TYPES = {
  cuda: 'Cuda',
  opencl: 'OpenCL',
  openmp: 'OpenMP',
};

export default class PyFrRuntimeBackend extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.assign(
      { cuda: 'round-robin', active: '', openmp: '', opencl: '', options: [] },
      this.getStateFromProps(this.props)
    );

    this.updateActiveType = this.updateActiveType.bind(this);
    this.updateActiveProfile = this.updateActiveProfile.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getStateFromProps(nextProps));
  }

  // Automatically update backend when needed
  componentDidUpdate() {
    const active = this.state.active;
    const value = this.state[active];
    if (!active || !this.props.owner() || !this.state) {
      return;
    }

    const backend = { type: active };
    if (active === 'cuda') {
      backend['device-id'] = value;
    } else if (this.state.backendProfile && this.state.backendProfile[active]) {
      const addOn = this.state.backendProfile[active].find(
        (item) => item.name === this.state[active]
      );
      Object.assign(backend, addOn);
    }

    // Prevent many call if backend is the same
    const lastPush = JSON.stringify(backend);
    if (this.lastPush !== lastPush) {
      this.lastPush = lastPush;
      this.props.owner().setState({ backend });
    }
  }

  getStateFromProps(props) {
    const newState = Object.assign(
      { backendProfile: { cuda: false, openmp: [], opencl: [] } },
      this.state
    );
    const previousClusterId = this.state ? this.state.clusterId : '';

    if (props.parentState.serverType === 'Traditional') {
      const clusterId = props.parentState.Traditional.profile;
      const backendProfile = get(
        props,
        `parentProps.clusters.${clusterId}.config.pyfr`
      );
      if (backendProfile && previousClusterId !== clusterId) {
        newState.clusterId = clusterId;
        newState.backendProfile = backendProfile;

        // Update options
        newState.options = [];
        if (backendProfile.cuda) {
          newState.active = 'cuda';
          newState.options.push('cuda');
        }
        if (get(backendProfile, 'opencl.length')) {
          newState.active = 'opencl';
          newState.options.push('opencl');
          newState.opencl = backendProfile.opencl[0].name;
        }
        if (get(backendProfile, 'openmp.length')) {
          newState.active = 'openmp';
          newState.options.push('openmp');
          newState.openmp = backendProfile.openmp[0].name;
        }
      }
    }

    return newState;
  }

  updateActiveType(event) {
    const active = event.target.value;
    this.setState({ active });
  }

  updateActiveProfile(event) {
    const active = this.state.active;
    const value = event.target.value;
    this.setState({ [active]: value });
  }

  render() {
    if (this.props.parentState.serverType !== 'Traditional') {
      return null;
    }

    let profiles = [];
    if (
      this.state.backendProfile &&
      this.state.backendProfile[this.state.active] &&
      this.state.active !== 'cuda'
    ) {
      profiles = this.state.backendProfile[this.state.active];
    }

    return (
      <div>
        <section className={formStyle.group}>
          <label className={formStyle.label}>Backend</label>
          <select
            className={formStyle.input}
            value={this.state.active}
            onChange={this.updateActiveType}
          >
            {this.state.options.map((key, index) => (
              <option key={`${key}_${index}`} value={key}>
                {TYPES[key]}
              </option>
            ))}
          </select>
        </section>
        <section
          className={
            this.state.active !== 'cuda' ? formStyle.hidden : formStyle.group
          }
        >
          <label className={formStyle.label}>Device</label>
          <select
            className={formStyle.input}
            value={this.state.cuda}
            onChange={this.updateActiveProfile}
          >
            <option value="round-robin">Round Robin</option>
            <option value="local-rank">Local Rank</option>
          </select>
        </section>
        <section
          className={
            this.state.active === 'cuda' ? formStyle.hidden : formStyle.group
          }
        >
          <label className={formStyle.label}>Profile</label>
          <select
            className={formStyle.input}
            value={this.state[this.state.active]}
            onChange={this.updateActiveProfile}
          >
            {profiles.map((profile, index) => (
              <option key={`${profile.name}_${index}`} value={profile.name}>
                {profile.name}
              </option>
            ))}
          </select>
        </section>
      </div>
    );
  }
}

PyFrRuntimeBackend.propTypes = {
  owner: PropTypes.func,
  parentState: PropTypes.object,
  /* eslint-disable react/no-unused-prop-types */
  parentProps: PropTypes.object,
  /* eslint-enable react/no-unused-prop-types */
};

PyFrRuntimeBackend.defaultProps = {
  owner: undefined,
  parentState: undefined,
  parentProps: undefined,
};
