import React from 'react';
import PropTypes from 'prop-types';

import style from 'HPCCloudStyle/ItemEditor.mcss';

export default class SchedulerConfigPBS extends React.Component {
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
              this.props.runtime && this.props.max && this.props.max.pbs
                ? this.props.max.pbs.numberOfNodes
                : null
            }
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
            max={
              this.props.runtime && this.props.max && this.props.max.pbs
                ? this.props.max.pbs.numberOfCoresPerNode
                : null
            }
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
            max={
              this.props.runtime && this.props.max && this.props.max.pbs
                ? this.props.max.pbs.numberOfGpusPerNode
                : null
            }
            value={this.props.config.pbs.numberOfGpusPerNode}
            data-key="pbs.numberOfGpusPerNode"
            onChange={this.updateConfig}
          />
        </section>
      </div>
    );
  }
}

SchedulerConfigPBS.propTypes = {
  config: PropTypes.object,
  max: PropTypes.object,
  onChange: PropTypes.func,
  runtime: PropTypes.bool,
};

SchedulerConfigPBS.defaultProps = {
  config: undefined,
  max: undefined,
  onChange: undefined,
  runtime: undefined,
};
