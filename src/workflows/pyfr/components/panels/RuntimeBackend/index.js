import React      from 'react';
import deepEquals from 'mout/src/lang/deepEquals';
import get        from '../../../../..//utils/get';
import formStyle  from 'HPCCloudStyle/ItemEditor.mcss';

const TYPES = {
  cuda: 'Cuda',
  opencl: 'OpenCL',
  openmp: 'OpenMP',
};

export default React.createClass({

  displayName: 'pyfr-exec/RuntimeBackend',

  propTypes: {
    visible: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    profiles: React.PropTypes.object,
  },

  getInitialState() {
    const state = Object.assign({ device: 'round-robin', profile: 'cuda', backend: { type: 'cuda' } }, this.getStateFromProps(this.props));
    this.updateBackend(state.type, state.profile, state.device);
    return state;
  },

  componentWillReceiveProps(nextProps) {
    const { type, types, profile } = this.getStateFromProps(nextProps);

    if (types.indexOf(this.state.type) === -1) {
      this.setState({ type, types, profile });
      this.updateBackend(type, profile, this.state.device);
    } else {
      this.setState({ types });
      this.updateBackend(this.state.type, this.state.profile, this.state.device);
    }
  },

  getStateFromProps(props) {
    let type = '';
    let profile = '';
    const types = [];

    if (props.profiles) {
      if (props.profiles.cuda) {
        type = 'cuda';
        types.push(type);
      }
      if (get(props, 'profiles.opencl.length')) {
        type = 'opencl';
        types.push(type);
        profile = props.profiles.opencl[0].name;
      }
      if (get(props, 'profiles.openmp.length')) {
        type = 'openmp';
        types.push(type);
        profile = props.profiles.openmp[0].name;
      }
    }
    return { type, types, profile };
  },

  updateActiveType(event) {
    const type = event.target.value;
    const profile = this.props.profiles[type][0] ? this.props.profiles[type][0].name : '';
    this.setState({ type, profile });

    this.updateBackend(type, profile, this.state.device);
  },

  updateActiveProfile(event) {
    const profile = event.target.value;
    this.setState({ profile });
    this.updateBackend(this.state.type, profile, '');
  },

  updateDevice(event) {
    const device = event.target.value;
    this.setState({ device });
    this.updateBackend(this.state.type, {}, device);
  },

  updateBackend(type, profile, device) {
    if (!type) {
      return;
    }

    const backend = { type };
    if (type === 'cuda') {
      backend['device-id'] = device;
    } else { // type === 'openmp'
      if (this.props.profiles[type]) {
        const addOn = this.props.profiles[type].filter(item => item.name === profile);
        if (addOn.length) {
          Object.assign(backend, addOn[0]);
        }
      }
    }
    if (this.props.onChange) {
      // this is called in `componentWillReceiveProps`, before state is available so guard it.
      if (this.state && this.state.backend && !deepEquals(this.state.backend, backend)) {
        this.setState({ backend });
        this.props.onChange(backend);
      }
    }
  },

  render() {
    if (!this.props.visible) {
      return null;
    }

    let profiles = [];
    if (get(this.props, `profiles.${this.state.type}`) && Array.isArray(this.props.profiles[this.state.type])) {
      profiles = this.props.profiles[this.state.type];
    }

    return (
      <div>
          <section className={formStyle.group}>
              <label className={formStyle.label}>Backend</label>
              <select
                className={formStyle.input}
                value={this.state.type}
                onChange={ this.updateActiveType }
              >
                { this.state.types.map((key, index) =>
                  <option key={ `${key}_${index}` } value={ key }>{ TYPES[key] }</option>
                )}
              </select>
          </section>
          <section className={ this.state.type !== 'cuda' ? formStyle.hidden : formStyle.group }>
            <label className={formStyle.label}>Device</label>
              <select
                className={formStyle.input}
                value={this.state.device}
                onChange={ this.updateDevice }
              >
                <option value="round-robin">Round Robin</option>
                <option value="local-rank">Local Rank</option>
              </select>
          </section>
          <section className={ this.state.type === 'cuda' ? formStyle.hidden : formStyle.group }>
            <label className={formStyle.label}>Profile</label>
              <select
                className={formStyle.input}
                value={this.state.profile}
                onChange={ this.updateActiveProfile }
              >
                { profiles.map((profile, index) =>
                  <option key={ `${profile.name}_${index}` } value={ profile.name }>{ profile.name }</option>
                )}
              </select>
          </section>
      </div>);
  },
});
