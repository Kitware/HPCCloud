import React from 'react';
import PropTypes from 'prop-types';

import style from 'HPCCloudStyle/ItemEditor.mcss';

export default class SchedulerConfigSLURM extends React.Component {
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
          <label className={style.label}>Number of nodes</label>
          <input
            className={style.input}
            type="number"
            min="1"
            max={
              this.props.runtime && this.props.max && this.props.max.slurm
                ? this.props.max.slurm.numberOfNodes
                : null
            }
            value={this.props.config.slurm.numberOfNodes}
            data-key="slurm.numberOfNodes"
            onChange={this.updateConfig}
          />
        </section>
        <section className={style.group}>
          <label className={style.label}>Cores/Node</label>
          <input
            className={style.input}
            type="number"
            min="1"
            max={
              this.props.runtime && this.props.max && this.props.max.slurm
                ? this.props.max.slurm.numberOfCoresPerNode
                : null
            }
            value={this.props.config.slurm.numberOfCoresPerNode}
            data-key="slurm.numberOfCoresPerNode"
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
              this.props.runtime && this.props.max && this.props.max.slurm
                ? this.props.max.slurm.numberOfGpusPerNode
                : null
            }
            value={this.props.config.slurm.numberOfGpusPerNode}
            data-key="slurm.numberOfGpusPerNode"
            onChange={this.updateConfig}
          />
        </section>
      </div>
    );
  }
}

SchedulerConfigSLURM.propTypes = {
  config: PropTypes.object,
  max: PropTypes.object,
  onChange: PropTypes.func,
  runtime: PropTypes.bool,
};

SchedulerConfigSLURM.defaultProps = {
  config: undefined,
  max: undefined,
  onChange: undefined,
  runtime: undefined,
};
