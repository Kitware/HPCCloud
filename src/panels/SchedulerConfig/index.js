import React from 'react';
import PropTypes from 'prop-types';

import deepEquals from 'mout/src/lang/deepEquals';

import style from 'HPCCloudStyle/ItemEditor.mcss';

import SGE from './SGE';
import SLURM from './SLURM';
import PBS from './PBS';

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
        numberOfNodes: 1,
      },
      pbs: {
        numberOfGpusPerNode: 0,
        numberOfCoresPerNode: 1,
        numberOfNodes: 1,
      },
    },
    config
  );
}

export default class SchedulerConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: addDefaults(props.config),
    };
    this.updateConfig = this.updateConfig.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const config = nextProps.config;
    const oldConfig = this.props.config;

    if (!deepEquals(config, oldConfig)) {
      this.setState({ config: addDefaults(config) });
      this.props.onChange(addDefaults(config));
    }
  }

  updateConfig(event) {
    const keyPath = event.target.dataset.key.split('.');
    let currentContainer;

    if (this.props.onChange) {
      const lastKey = keyPath.pop();
      const valueToSave = event.target.value;
      const config = this.state.config;

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
  }

  render() {
    const SubConfig = typeMapping[this.state.config.type || 'sge'];
    return (
      <div>
        <section className={this.props.runtime ? style.hidden : style.group}>
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
        <SubConfig
          config={this.state.config}
          max={this.props.max}
          runtime={this.props.runtime}
          onChange={this.updateConfig}
        />
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
          <label className={style.label}>
            {this.props.runtime ? 'Queue' : 'Default queue'}
          </label>
          <input
            className={style.input}
            type="text"
            value={this.state.config.defaultQueue}
            data-key="defaultQueue"
            onChange={this.updateConfig}
          />
        </section>
      </div>
    );
  }
}

SchedulerConfig.propTypes = {
  config: PropTypes.object,
  max: PropTypes.object,
  onChange: PropTypes.func,
  runtime: PropTypes.bool,
};

SchedulerConfig.defaultProps = {
  runtime: false,
  config: undefined,
  max: undefined,
  onChange: undefined,
};
