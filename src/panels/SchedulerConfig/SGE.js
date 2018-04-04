import React from 'react';
import PropTypes from 'prop-types';

import style from 'HPCCloudStyle/ItemEditor.mcss';

export default class SchedulerConfigSGE extends React.Component {
  constructor(props) {
    super(props);
    this.updateConfig = this.updateConfig.bind(this);
  }

  updateConfig(event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }

  render() {
    return (
      <div>
        <section className={style.group}>
          <label className={style.label}>Number of slots</label>
          <input
            className={style.input}
            type="number"
            min="1"
            max={
              this.props.runtime && this.props.max && this.props.max.sge
                ? this.props.max.sge.numberOfSlots
                : null
            }
            value={this.props.config.sge.numberOfSlots}
            data-key="sge.numberOfSlots"
            onChange={this.updateConfig}
          />
        </section>
        <section className={style.group}>
          <label className={style.label}>GPUs/Node</label>
          <input
            className={style.input}
            type="number"
            min="0"
            max={
              this.props.runtime && this.props.max && this.props.max.sge
                ? this.props.max.sge.numberOfGpusPerNode
                : null
            }
            value={this.props.config.sge.numberOfGpusPerNode}
            data-key="sge.numberOfGpusPerNode"
            onChange={this.updateConfig}
          />
        </section>
        <section className={style.group}>
          <label className={style.label}>Parallel Environment</label>
          <input
            className={style.input}
            type="text"
            value={this.props.config.sge.parallelEnvironment}
            data-key="sge.parallelEnvironment"
            onChange={this.updateConfig}
            required
          />
        </section>
      </div>
    );
  }
}

SchedulerConfigSGE.propTypes = {
  config: PropTypes.object,
  max: PropTypes.object,
  onChange: PropTypes.func,
  runtime: PropTypes.bool,
};

SchedulerConfigSGE.defaultProps = {
  config: undefined,
  max: undefined,
  onChange: undefined,
  runtime: undefined,
};
