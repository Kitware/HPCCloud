import React      from 'react';
import deepEquals from 'mout/src/lang/deepEquals';

import style      from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({

  displayName: 'SchedulerConfig',

  propTypes: {
    config: React.PropTypes.object,
    onChange: React.PropTypes.func,
  },

  getInitialState() {
    return {
      config: this.props.config || {},
    };
  },

  componentWillReceiveProps(nextProps) {
    const config = nextProps.config,
      oldConfig = this.props.config;

    if (!deepEquals(config, oldConfig)) {
      this.setState({ config });
    }
  },

  render() {
    return (
      <div>
        <section className={style.group}>
          <label className={style.label}>Scheduler</label>
          <select
            className={style.input}
            value={this.state.config.scheduler.type}
            data-key="config.scheduler.type"
            onChange={this.formChange}
            required
          >
            <option value="sge">Sun Grid Engine</option>
            <option value="pbs">PBS</option>
            <option value="slurm">SLURM</option>
          </select>
        </section>
      </div>);
  },
});
