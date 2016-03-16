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

function addDefaults(config) {
  return Object.assign(
    {
      type: 'sge',
      maxWallTime: { hours: 0, minutes: 0, seconds: 0 },
      defaultQueue: '',
      sge: {
        numberOfGpusPerNode: 0,
        numberOfSlots: 1,
      },
      slurm: {
        numberOfGpusPerNode: 0,
        numberOfCoresPerNode: 1,
        numberOfCores: 1,
      },
      pbs: {
        numberOfGpusPerNode: 0,
        numberOfCoresPerNode: 1,
        numberOfCores: 1,
      },
    }, config);
}

export default React.createClass({

  displayName: 'SchedulerConfig',

  propTypes: {
    config: React.PropTypes.object,
    max: React.PropTypes.object,
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
      config: addDefaults(this.props.config),
    };
  },

  componentWillReceiveProps(nextProps) {
    const config = nextProps.config,
      oldConfig = this.props.config;

    if (!deepEquals(config, oldConfig)) {
      this.setState({ config: addDefaults(config) });
      this.props.onChange(addDefaults(config));
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
        <SubConfig config={ this.state.config } max={ this.props.max } runtime={ this.props.runtime} onChange={ this.updateConfig } />
        <section className={style.group}>
          <label className={style.label}>Max runtime</label>
          <input
            className={style.input}
            type="number"
            min="0"
            value={this.state.config.maxWallTime.hours}
            title="Number of hours"
            data-key="maxWallTime.hours"
            onChange={this.updateConfig}
          />
          <input
            className={style.input}
            type="number"
            min="0"
            max="59"
            value={this.state.config.maxWallTime.minutes}
            title="Number of minutes"
            data-key="maxWallTime.minutes"
            onChange={this.updateConfig}
          />
          <input
            className={style.input}
            type="number"
            min="0"
            max="59"
            value={this.state.config.maxWallTime.seconds}
            title="Number of seconds"
            data-key="maxWallTime.seconds"
            onChange={this.updateConfig}
          />
        </section>
        <section className={style.group}>
          <label className={style.label}>{ this.props.runtime ? 'Queue' : 'Default queue' }</label>
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
