import deepEquals   from 'mout/src/lang/deepEquals';
import React        from 'react';
import Workflows    from '../../../workflows';
import FormPanel    from '../../../panels/FormPanel';

import CollapsibleWidget from 'paraviewweb/src/React/Widgets/CollapsibleWidget';

import style         from 'HPCCloudStyle/ItemEditor.mcss';

const preventDefault = (e) => { e.preventDefault(); };

const allConfigs = {};
const wfNames = [];

for (const wfName in Workflows) {
  const wf = Workflows[wfName];
  allConfigs[wfName] = {};
  let foundConfig = false;
  if (wf.config && wf.config.cluster) {
    for (const propKey in wf.config.cluster) {
      allConfigs[wfName][propKey] = wf.config.cluster[propKey];
      foundConfig = true;
    }
  }
  if (foundConfig) {
    wfNames.push(wfName);
  }
}

export default React.createClass({

  displayName: 'ClusterForm',

  propTypes: {
    data: React.PropTypes.object,
    onChange: React.PropTypes.func,
  },

  getInitialState() {
    return {
      data: this.props.data,
    };
  },

  componentWillReceiveProps(nextProps) {
    const data = nextProps.data,
      oldData = this.props.data;

    if (!deepEquals(data, oldData)) {
      this.setState({ data });
    }
  },

  formChange(event) {
    var keyPath = event.target.dataset.key.split('.'),
      currentContainer;
    if (this.props.onChange) {
      const lastKey = keyPath.pop(),
        valueToSave = event.target.value,
        data = this.state.data;

      currentContainer = data;
      while (keyPath.length) {
        const nextKey = keyPath.shift();
        if (!currentContainer[nextKey]) {
          currentContainer[nextKey] = {};
        }
        currentContainer = currentContainer[nextKey];
      }

      currentContainer[lastKey] = valueToSave;
      this.setState({ data });
      this.props.onChange(data);
    }
  },

  mergeData(updatedData) {
    const data = Object.assign({}, this.state.data, updatedData);
    this.setState({ data });
    this.props.onChange(data);
  },

  render() {
    if (!this.state.data) {
      return null;
    }

    const sepa = <hr style={{ position: 'relative', top: '-2px' }} />;

    return (
      <div>
          <section className={style.group}>
              <label className={style.label}>Name</label>
              <input
                className={style.input}
                type="text"
                value={this.state.data.name}
                data-key="name"
                onChange={this.formChange}
                required
              />
          </section>
          <section className={style.group}>
              <label className={style.label}>Hostname</label>
              <input
                className={style.input}
                type="text"
                value={this.state.data.config.host}
                data-key="config.host"
                onChange={this.formChange}
                required
              />
          </section>
          <section className={style.group}>
              <label className={style.label}>Username</label>
              <input
                className={style.input}
                type="text"
                value={this.state.data.config.ssh.user}
                data-key="config.ssh.user"
                onChange={this.formChange}
                required
              />
          </section>
          <section className={style.group}>
              <label className={style.label}>Output Directory</label>
              <input
                className={style.input}
                type="text"
                value={this.state.data.config.jobOutputDir}
                data-key="config.jobOutputDir"
                onChange={this.formChange}
                required
              />
          </section>
          <section className={style.group}>
              <label className={style.label}>Number of Slots</label>
              <input
                className={style.input}
                type="text"
                value={this.state.data.config.numberOfSlots}
                data-key="config.numberOfSlots"
                onChange={this.formChange}
                required
              />
          </section>
          <section className={style.group}>
              <label className={style.label}>Parallel Environment</label>
              <input
                className={style.input}
                type="text"
                value={this.state.data.config.parallelEnvironment}
                data-key="config.parallelEnvironment"
                onChange={this.formChange}
                required
              />
          </section>
          <section className={style.group}>
              <label className={style.label}>Scheduler</label>
              <select
                className={style.input}
                value={this.state.data.config.scheduler.type}
                data-key="config.scheduler.type"
                onChange={this.formChange}
                required
              >
                <option value="sge">Sun Grid Engine</option>
                <option value="pbs">PBS</option>
                <option value="slurm">SLURM</option>
              </select>
          </section>
          { this.state.data.status !== 'running' ? null :
            <section className={style.group}>
              <label className={style.label}>Public SSH key</label>
              <textarea
                className={style.input}
                readOnly
                rows="3"
                value={ this.state.data.config.ssh.publicKey }
              />
            </section>
          }
          { (this.state.data.status === 'created' && this.state.data.config.ssh.publicKey) ?
            <section className={style.group}>
              <label className={style.label}>Command to add this key to cluster</label>
              <textarea
                className={style.input}
                style={{ color: '#a00' }}
                readOnly
                rows="3"
                value={
                  `echo "${this.state.data.config.ssh.publicKey}" | \
ssh ${this.state.data.config.ssh.user}@${this.state.data.config.host} \
"umask 077 && mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"`}
              />
              </section> :
              null
          }
          { wfNames.map(name =>
            <CollapsibleWidget title={ Workflows[name].name } open={ false } key={name} subtitle={ sepa }>
            <form onSubmit={ preventDefault }>
              <FormPanel config={ allConfigs[name] } style={ style } data={ this.state.data } onChange={ this.mergeData } />
            </form>
            </CollapsibleWidget>
          )}
      </div>);
  },
});
