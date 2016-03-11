import React     from 'react';
import formStyle from 'HPCCloudStyle/ItemEditor.mcss';

const TYPES = {
  cuda: 'Cuda',
  opencl: 'OpenCL',
  openmp: 'OpenMP',
};

export default React.createClass({

  displayName: 'pyfr-exec/RuntimeBackend',

  propTypes: {
    onChange: React.PropTypes.func,
    profiles: React.PropTypes.object,
  },

  getInitialState() {
    const state = Object.assign({ device: 'round-robin', profile: 'cuda' }, this.getStateFromProps(this.props));
    return state;
  },

  componentWillReceiveProps(nextProps) {
    const { type, types } = this.getStateFromProps(nextProps);
    if (types.indexOf(this.state.type) === -1) {
      this.setState({ type, types });
    } else {
      this.setState({ types });
    }
  },

  getStateFromProps(props) {
    let type = '';
    const types = [];

    if (props.profiles) {
      if (props.profiles.cuda) {
        type = 'cuda';
        types.push(type);
      }
      if (props.profiles.opencl && props.profiles.opencl.length) {
        type = 'opencl';
        types.push(type);
      }
      if (props.profiles.openmp && props.profiles.openmp.length) {
        type = 'openmp';
        types.push(type);
      }
    }
    return { type, types };
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
    const backend = { type };
    if (type === 'cuda') {
      backend['device-id'] = device;
    } else {
      const addOn = this.props.profiles[type].filter(item => item.name === profile);
      if (addOn.length) {
        Object.assign(backend, addOn[0]);
      }
    }
    if (this.props.onChange) {
      this.props.onChange(backend);
    }
  },

  render() {
    const profiles =
      this.props.profiles && this.props.profiles[this.state.type] && Array.isArray(this.props.profiles[this.state.type])
      ? this.props.profiles[this.state.type] : [];
    return (
      <div>
          <section className={formStyle.group}>
              <label className={formStyle.label}>Backend</label>
              <select
                className={formStyle.input}
                value={this.state.type}
                onChange={ this.updateActiveType }
              >
                { this.state.types.map(key =>
                  <option value={ key } key={ key }>{ TYPES[key] }</option>
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
                { profiles.map(profile =>
                  <option value={ profile.name } key={ profile.name }>{ profile.name }</option>
                )}
              </select>
          </section>
      </div>);
  },
});
