import client           from '../../../network';
import ClusterForm      from './ClusterForm';
import { setPathTo }    from '../../../utils/Helper';
import deepClone        from 'mout/src/lang/deepClone';
import ActiveList       from '../../../panels/ActiveList';
import Toolbar          from '../../../panels/Toolbar';
import ButtonBar        from '../../../panels/ButtonBar';
import React            from 'react';
import { breadcrumb }   from '..';

import style from 'HPCCloudStyle/PageWithMenu.mcss';

var clusterPresets = {};
const clusterBreadCrumb = Object.assign({}, breadcrumb, { active: 1 });

const STATUS_TO_ICON = {
  error: style.statusErrorIcon,
  creating: style.statusCreatingIcon,
  created: style.statusCreatedIcon,
  running: style.statusRunningIcon,
};

function updateClusterStatusAsClassPrefix(clusters) {
  clusters.forEach(cluster => {
    // Debug
    if (!STATUS_TO_ICON[cluster.status]) {
      console.log('missing icon for:', cluster.status);
    }

    cluster.classPrefix = STATUS_TO_ICON[cluster.status];
  });
}

function applyPreset(obj, name) {
  const config = clusterPresets ? clusterPresets[name] : null;
  if (config) {
    Object.keys(config).forEach(key => {
      setPathTo(obj, key, config[key]);
    });
  }
}

function getActions(disabled, test) {
  if (test) {
    return [
      { name: 'removeItem', label: 'Delete', icon: style.deleteIcon, disabled },
      { name: 'saveItem', label: 'Save', icon: style.saveIcon, disabled },
      { name: 'testCluster', label: 'Test', icon: style.testIcon, disabled },
    ];
  }
  return [
    { name: 'removeItem', label: 'Delete', icon: style.deleteIcon, disabled },
    { name: 'saveItem', label: 'Save', icon: style.saveIcon, disabled },
  ];
}

// Fetch cluster preferences only once
client.getClusterPresets()
  .then(
    presets => {
      clusterPresets = presets.data;
    },
    error => {
      console.log('Error fetching presets', error);
    });

/* eslint-disable no-alert */
export default React.createClass({

  displayName: 'Preferences/Cluster',

  propTypes: {
    clusterTemplate: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      clusterTemplate: {
        name: 'new cluster',
        type: 'trad',
        config: {
          host: 'localhost',
          ssh: {
            user: 'Your_Login',
          },
          scheduler: {
            type: 'sge',
          },
          parallelEnvironment: '',
          numberOfSlots: 1,
          jobOutputDir: '/tmp',
          paraview: {
            installDir: '/opt/paraview',
          },
          hydra: {
            executablePath: '/some/path/fake',
          },
        },
      },
    };
  },

  getInitialState() {
    return {
      active: 0,
      clusters: [],
      buttonsDisabled: false,
    };
  },

  componentWillMount() {
    this.updateState();

    this.eventSubscription = client.onEvent((e) => {
      if (e.type === 'cluster.status') {
        this.updateState();
      }
    });
  },

  componentWillUnmount() {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
      this.eventSubscription = null;
    }
  },

  updateState() {
    client.listClusterProfiles()
      .then(resp => this.setState({ clusters: resp.data }))
      .catch(err => console.log('Error: Pref/Cluster/list', err));
  },

  changeItem(item) {
    var clusters = this.state.clusters;
    clusters[this.state.active] = item;
    this.setState({ clusters });
  },

  activeChange(active) {
    this.setState({ active });
  },

  addItem() {
    var clusters = this.state.clusters,
      newItem = deepClone(this.props.clusterTemplate);
    newItem.idx = clusters.length;
    clusters.push(newItem);

    // FIXME
    const profileNames = Object.keys(clusterPresets);
    applyPreset(newItem, profileNames[Math.floor(profileNames.length * Math.random())]);
    // FIXME

    this.setState({ clusters, active: clusters.length - 1 });
  },

  removeItem() {
    var clusters = this.state.clusters,
      newActive;

    const clusterToDelete = clusters.splice(this.state.active, 1)[0];
    if (this.state.active === 0 && clusters.length > 0) {
      newActive = 0;
    } else if (this.state.active === 0) {
      newActive = null;
    } else {
      newActive = this.state.active - 1;
    }
    this.setState({ clusters, active: newActive });

    console.log('about to remove?', clusterToDelete._id);
    if (clusterToDelete._id && confirm('Are you sure you want to delete this cluster?')) {
      this.setState({ active: newActive, actionsDisabled: true });
      client.deleteCluster(clusterToDelete._id)
        .then(resp => {
          this.setState({ actionsDisabled: false });
          this.updateState();
        })
        .catch(err => {
          console.log('Error deleting cluster', err);
          this.setState({ actionsDisabled: false });
          this.updateState();
        });
    }
  },

  saveItem() {
    const clusters = this.state.clusters;
    const cluster = clusters[this.state.active];
    this.setState({ actionsDisabled: true });
    client.saveCluster(cluster)
      .then(resp => {
        clusters[this.state.active] = resp.data;
        this.setState({ error: null, clusters, actionsDisabled: false });
      })
      .catch(err => {
        this.setState({ error: err.data.message, actionsDisabled: false });
        console.log('Error: Pref/Cluster/save', err);
      });
  },

  testCluster() {
    console.log('test');
    const cluster = this.state.clusters[this.state.active];
    this.setState({ actionsDisabled: true });
    if (cluster._id) {
      client.testCluster(cluster._id)
        .then(resp => {
          this.setState({ actionsDisabled: false });
          console.log('success test', resp.data);
        })
        .catch(err => {
          this.setState({ actionsDisabled: false });
          console.log('error test', err);
        });
    }
  },

  formAction(action) {
    this[action]();
  },

  render() {
    const activeData = this.state.active < this.state.clusters.length ? this.state.clusters[this.state.active] : null;

    updateClusterStatusAsClassPrefix(this.state.clusters);
    return (
      <div className={ style.rootContainer }>
        <Toolbar
          breadcrumb={ clusterBreadCrumb }
          title="Clusters"
          actions={[{ name: 'add', icon: style.addIcon }]}
          onAction={this.addItem}
        />
        <div className={ style.container }>
          <ActiveList
            className={ style.menu }
            onActiveChange={this.activeChange}
            active={this.state.active}
            list={this.state.clusters}
          />
          <div className={ style.content }>
            <ClusterForm
              data={activeData}
              onChange={ this.changeItem }
            />
            <ButtonBar
              visible={!!activeData}
              onAction={ this.formAction }
              error={ this.state.error }
              actions={getActions(this.state.buttonsDisabled, activeData && activeData.config.ssh.publicKey && activeData.status !== 'running')}
            />
          </div>
        </div>
      </div>);
  },
});
