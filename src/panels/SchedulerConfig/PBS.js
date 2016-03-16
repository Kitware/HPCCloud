import React from 'react';
import style from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({

  displayName: 'SchedulerConfig/PBS',

  propTypes: {
    config: React.PropTypes.object,
    max: React.PropTypes.object,
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
            max={ this.props.runtime && this.props.max && this.props.max.pbs ? this.props.max.pbs.numberOfNodes : null }
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
            max={ this.props.runtime && this.props.max && this.props.max.pbs ? this.props.max.pbs.numberOfCoresPerNode : null }
            value={this.props.config.pbs.numberOfCoresPerNode}
            data-key="pbs.numberOfCoresPerNode"
            onChange={this.updateConfig}
          />
        </section>
        <section className={style.group}>
          <label className={style.label}>GPUs/Node</label>
          <input
            className={style.input}
            type="number"
            min="0"
            max={ this.props.runtime && this.props.max && this.props.max.pbs ? this.props.max.pbs.numberOfGpusPerNode : null }
            value={this.props.config.pbs.numberOfGpusPerNode}
            data-key="pbs.numberOfGpusPerNode"
            onChange={this.updateConfig}
          />
        </section>
      </div>);
  },
});
