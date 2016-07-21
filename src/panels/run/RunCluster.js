import client           from '../../network';
import React            from 'react';
import { Link }         from 'react-router';
import deepClone        from 'mout/src/lang/deepClone';
import SchedulerConfig  from '../SchedulerConfig';

import style    from 'HPCCloudStyle/ItemEditor.mcss';
import theme    from 'HPCCloudStyle/Theme.mcss';

function isEmptyWallTime(walltime) {
  if (!walltime) {
    return true;
  }

  const undefinedKeys = ['hours', 'minutes', 'seconds'].filter(k =>
    walltime[k] === '' ||
    walltime[k] === '0' ||
    walltime[k] === 0 ||
    walltime[k] === null ||
    walltime[k] === undefined);

  return undefinedKeys.length === 3;
}

export default React.createClass({
  displayName: 'panels/run/RunCluster',

  propTypes: {
    contents: React.PropTypes.object,
    onChange: React.PropTypes.func,
    clusterFilter: React.PropTypes.func,
  },

  getInitialState() {
    return {
      busy: false,
      profiles: [],
      profile: {},
    };
  },

  componentDidMount() {
    this.updateState();
  },

  updateState() {
    this.setState({ busy: true });
    client.listClusters('trad')
      .then((resp) => {
        let clusters = resp.data;

        if (this.props.clusterFilter) {
          clusters = clusters.filter(this.props.clusterFilter);
        }

        this.setState({
          profiles: clusters,
          profile: clusters[0] ? clusters.length > 0 : null,
          busy: false,
        });
        if (this.props.onChange) {
          this.props.onChange('profile', resp.data[0]._id, 'Traditional');
        }
      })
      .catch((err) => {
        console.log('Error: Sim/RunCluster', err);
        this.setState({ busy: false });
      });
  },

  dataChange(event) {
    if (this.props.onChange) {
      this.props.onChange(event.target.dataset.key, event.target.value, 'Traditional');
    }
  },

  updateRuntimeConfig(config) {
    const runtime = Object.assign({}, config);
    Object.assign(runtime, runtime[runtime.type]);
    runtime.queue = runtime.defaultQueue;

    ['sge', 'slurm', 'pbs', 'type', 'defaultQueue'].forEach(keyToDelete => {
      delete runtime[keyToDelete];
    });
    if (isEmptyWallTime(runtime.maxWallTime)) {
      delete runtime.maxWallTime;
    }

    this.props.onChange('runtime', runtime, 'Traditional');
  },

  render() {
    var optionMapper = (el, index) =>
      <option
        key={ `${el.name}_${index}` }
        value={el._id}
      >{el.name}</option>;

    if (this.state.profiles.length === 0) {
      return this.state.busy ? null :
        <div className={ [style.container, theme.warningBox].join(' ') }>
            <span>There are no Traditional Clusters defined with the required configuration. Add some on&nbsp;
            <Link to="/Preferences/Cluster">the Cluster preference page</Link>.
            </span>
        </div>;
    }

    const clusterData = this.state.profiles.filter(item => item._id === this.props.contents.profile)[0];
    const maxData = clusterData && clusterData.config && clusterData.config.scheduler ? clusterData.config.scheduler : {};
    const configData = deepClone(maxData);

    return (
      <div className={style.container}>
          <section className={style.group}>
              <label className={style.label}>Cluster</label>
              <select
                className={style.input}
                onChange={this.dataChange}
                data-key="profile"
                value={this.props.contents.profile}
              >
                {this.state.profiles.map(optionMapper)}
              </select>
          </section>
          <SchedulerConfig
            config={ configData }
            max={ maxData }
            onChange={ this.updateRuntimeConfig }
            runtime
          />
      </div>);
  },
});
