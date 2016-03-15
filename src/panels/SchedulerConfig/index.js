import React      from 'react';
import deepEquals from 'mout/src/lang/deepEquals';
import SGE        from './SGE';
import SLURM      from './SLURM';
import PBS        from './PBS';

import style      from 'HPCCloudStyle/ItemEditor.mcss';

const typeMapping = {
  sge: SGE,
  slurm: SLURM,
  pbs: PBS,
};

export default React.createClass({

  displayName: 'SchedulerConfig',

  propTypes: {
    config: React.PropTypes.object,
    onChange: React.PropTypes.func,
    runtime: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      runtime: false,
    };
  },

  getInitialState() {
    return {
      config: Object.assign(
        {
          type: 'sge',
          maxRuntime: 30,
          defaultQueue: 'default',
          sge: {
            numberOfGpus: 0,
            numberOfSlots: 1,
          },
          slurm: {
            numberOfGpus: 0,
            numberOfNodes: 1,
            numberOfCores: 1,
          },
          pbs: {
            numberOfGpus: 0,
            numberOfNodes: 1,
            numberOfCores: 1,
          },
        }, this.props.config),
    };
  },

  componentWillReceiveProps(nextProps) {
    const config = nextProps.config,
      oldConfig = this.props.config;

    if (!deepEquals(config, oldConfig)) {
      this.setState({ config });
      this.props.onChange(config);
    }
  },

  updateConfig(event) {
    var keyPath = event.target.dataset.key.split('.');
    var currentContainer;

    if (this.props.onChange) {
      const lastKey = keyPath.pop(),
        valueToSave = event.target.value,
        config = this.state.config;

      currentContainer = config;
      while (keyPath.length) {
        const nextKey = keyPath.shift();
        if (!currentContainer[nextKey]) {
          currentContainer[nextKey] = {};
        }
        currentContainer = currentContainer[nextKey];
      }

      currentContainer[lastKey] = valueToSave;
      this.setState({ config });
      this.props.onChange(config);
    }
  },

  render() {
    const SubConfig = typeMapping[this.state.config.type || 'sge'];
    return (
      <div>
        <section className={ this.props.runtime ? style.hidden : style.group}>
          <label className={style.label}>Scheduler</label>
          <select
            className={style.input}
            value={this.state.config.type}
            data-key="type"
            onChange={this.updateConfig}
            required
          >
            <option value="sge">Sun Grid Engine</option>
            <option value="pbs">PBS</option>
            <option value="slurm">SLURM</option>
          </select>
        </section>
        <SubConfig config={ this.state.config } runtime={ this.props.runtime} onChange={ this.updateConfig } />
        <section className={style.group}>
          <label className={style.label}>Max runtime</label>
          <input
            className={style.input}
            type="number"
            min="1"
            value={this.state.config.maxRuntime}
            data-key="maxRuntime"
            onChange={this.updateConfig}
          />
        </section>
        <section className={style.group}>
          <label className={style.label}>Default queue</label>
          <input
            className={style.input}
            type="text"
            value={this.state.config.defaultQueue}
            data-key="defaultQueue"
            onChange={this.updateConfig}
          />
        </section>
      </div>);
  },
});
