import deepClone          from 'mout/src/lang/deepClone';
import set                from 'mout/src/object/set';

import React              from 'react';
import Workflows          from '../../../workflows';
import FormPanel          from '../../../panels/FormPanel';
import SchedulerConfig    from '../../../panels/SchedulerConfig';
import CollapsibleWidget  from 'paraviewweb/src/React/Widgets/CollapsibleWidget';

import style              from 'HPCCloudStyle/ItemEditor.mcss';

const preventDefault = (e) => { e.preventDefault(); };

const allConfigs = {};
const wfNames = [];

Object.keys(Workflows).forEach(wfName => {
  const wf = Workflows[wfName];
  allConfigs[wfName] = {};
  let foundConfig = false;
  if (wf.config && wf.config.cluster) {
    Object.keys(wf.config.cluster).forEach(propKey => {
      allConfigs[wfName][propKey] = wf.config.cluster[propKey];
      foundConfig = true;
    });
  }
  if (foundConfig) {
    wfNames.push(wfName);
  }
});

export default React.createClass({

  displayName: 'ClusterForm',

  propTypes: {
    data: React.PropTypes.object,
    onChange: React.PropTypes.func,
  },

  componentWillReceiveProps(nextProps) {
    if (!nextProps.data._id) {
      this.refs.nameInput.focus();
    }
  },

  formChange(event) {
    const propName = event.target.dataset.key;
    const value = event.target.value;

    if (this.props.onChange) {
      const data = deepClone(this.props.data);
      set(data, propName, value);
      this.props.onChange(data);
    }
  },

  updateConfig(scheduler) {
    const config = Object.assign(
      {},
      this.props.data.config,
      { scheduler: Object.assign({}, this.props.data.config.scheduler, scheduler) });

    this.mergeData({ config });
  },

  mergeData(updatedData) {
    const data = Object.assign({}, this.props.data, updatedData);
    this.props.onChange(data);
  },

  render() {
    if (!this.props.data) {
      return null;
    }

    const separator = <hr style={{ position: 'relative', top: '-2px' }} />;

    return (
      <div>
          <section className={style.group}>
              <label className={style.label}>Name</label>
              <input
                className={style.input}
                type="text"
                value={this.props.data.name}
                data-key="name"
                onChange={this.formChange}
                required
                ref="nameField"
              />
          </section>
          <section className={style.group}>
              <label className={style.label}>Hostname</label>
              <input
                className={style.input}
                type="text"
                value={this.props.data.config.host}
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
                value={this.props.data.config.ssh.user}
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
                value={this.props.data.config.jobOutputDir}
                data-key="config.jobOutputDir"
                onChange={this.formChange}
                required
              />
          </section>
          <SchedulerConfig config={ this.props.data.config.scheduler } onChange={ this.updateConfig } />
          { this.props.data.status !== 'running' ? null :
            <section className={style.group}>
              <label className={style.label}>Public SSH key</label>
              <textarea
                className={style.input}
                readOnly
                rows="3"
                value={ this.props.data.config.ssh.publicKey }
              />
            </section>
          }
          { (this.props.data.status === 'created' && this.props.data.config.ssh.publicKey) ?
            <section className={style.group}>
              <label className={style.label}>Command to add this key to cluster</label>
              <textarea
                className={style.input}
                style={{ color: '#a00' }}
                readOnly
                rows="3"
                value={
                  `echo "${this.props.data.config.ssh.publicKey}" | \
ssh ${this.props.data.config.ssh.user}@${this.props.data.config.host} \
"umask 077 && mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"`}
              />
              </section> :
              null
          }
          { wfNames.map((name, index) =>
            <CollapsibleWidget title={ Workflows[name].name } open={ false } key={`${name}_${index}`} subtitle={ separator }>
              <form onSubmit={ preventDefault }>
                <FormPanel config={ allConfigs[name] } style={ style } data={ this.props.data } onChange={ this.mergeData } />
              </form>
            </CollapsibleWidget>
          )}
      </div>);
  },
});
