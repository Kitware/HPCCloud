import React from 'react';
import style from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({

  displayName: 'SchedulerConfig/PBS',

  propTypes: {
    config: React.PropTypes.object,
    onChange: React.PropTypes.func,
    runtime: React.PropTypes.bool,
  },

  updateConfig(event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },

  render() {
    return (
      <div>
        <section className={style.group}>
          <label className={style.label}>Number of nodes</label>
          <input
            className={style.input}
            type="number"
            min="1"
            value={this.props.config.pbs.numberOfNodes}
            data-key="pbs.numberOfNodes"
            onChange={this.updateConfig}
          />
        </section>
        <section className={style.group}>
          <label className={style.label}>Cores/Node</label>
          <input
            className={style.input}
            type="number"
            min="1"
            value={this.props.config.pbs.numberOfCores}
            data-key="pbs.numberOfCores"
            onChange={this.updateConfig}
          />
        </section>
        <section className={style.group}>
          <label className={style.label}>GPUs/Node</label>
          <input
            className={style.input}
            type="number"
            min="0"
            value={this.props.config.pbs.numberOfGpus}
            data-key="pbs.numberOfGpus"
            onChange={this.updateConfig}
          />
        </section>
      </div>);
  },
});
