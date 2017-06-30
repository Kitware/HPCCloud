import React      from 'react';
import formStyle  from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({

  displayName: 'pyfr-exec/RuntimeBackend',

  propTypes: {
    owner: React.PropTypes.func,
    parentState: React.PropTypes.object,
    /* eslint-disable react/no-unused-prop-types */
    parentProps: React.PropTypes.object,
    /* eslint-emable react/no-unused-prop-types */
  },

  getInitialState() {
    return { mpiSize: 2, sparkSize: 2 };
  },

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
      const addOn = this.state.backendProfile[active].find((item) => item.name === this.state[active]);
      Object.assign(backend, addOn);
    }

    // Prevent many call if backend is the same
    const lastPush = JSON.stringify(backend);
    if (this.lastPush !== lastPush) {
      this.lastPush = lastPush;
      this.props.owner().setState({ backend });
    }
  },

  updateParam(event) {
    const which = event.target.dataset.which;
    const value = event.target.value;
    this.setState({ [which]: value });
  },

  render() {
    if (this.props.parentState.serverType !== 'Traditional') {
      return null;
    }

    return (
      <div>
          <section className={formStyle.group}>
              <label className={formStyle.label}>MPI Size</label>
              <input type="number" data-which="mpiSize" min="1"
                className={formStyle.input}
                value={this.state.mpiSize}
                onChange={ this.updateParam }
              />
          </section>
          <section className={formStyle.group}>
            <label className={formStyle.label}>Spark Size</label>
              <input type="number" data-which="sparkSize" min="1"
                className={formStyle.input}
                value={this.state.sparkSize}
                onChange={ this.updateParam }
              />
          </section>
      </div>);
  },
});
