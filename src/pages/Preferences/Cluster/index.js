// import client           from '../../../network';
import ClusterForm      from './ClusterForm';
import ActiveList       from '../../../panels/ActiveList';
import Toolbar          from '../../../panels/Toolbar';
import ButtonBar        from '../../../panels/ButtonBar';
import PresetSelector   from '../PresetSelector';
import React            from 'react';
import { breadcrumb }   from '..';

import style from 'HPCCloudStyle/PageWithMenu.mcss';

import get          from 'mout/src/object/get';
import { connect }  from 'react-redux';
import * as Actions from '../../../redux/actions/clusters';
import { dispatch } from '../../../redux';

const clusterBreadCrumb = Object.assign({}, breadcrumb, { active: 1 });

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

/* eslint-disable no-alert */
const ClusterPrefs = React.createClass({

  displayName: 'Preferences/Cluster',

  propTypes: {
    active: React.PropTypes.number,
    presetNames: React.PropTypes.array,
    list: React.PropTypes.array,
    error: React.PropTypes.string,
    simulations: React.PropTypes.object,
    taskflows: React.PropTypes.array,
    buttonsDisabled: React.PropTypes.bool,
    onUpdateItem: React.PropTypes.func,
    onActiveChange: React.PropTypes.func,
    onApplyPreset: React.PropTypes.func,
    onAddItem: React.PropTypes.func,
    onRemoveItem: React.PropTypes.func,
    onTestCluster: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      error: null,
      active: 0,
      list: [],
      buttonsDisabled: false,
      presetNames: [],
    };
  },

  getInitialState() {
    return { _error: null };
  },

  changeItem(item) {
    const { active, onUpdateItem } = this.props;
    onUpdateItem(active, item);
  },

  activeChange(active) {
    this.setState({ _error: null });
    this.props.onActiveChange(active);
  },

  presetChange(presetName) {
    this.props.onApplyPreset(this.props.active, presetName);
  },

  clusterHasSimulation(id) {
    for (let i = 0; i < this.props.taskflows.length; i++) {
      if (this.props.taskflows[i].flow.meta.cluster._id === id) {
        return this.props.taskflows[i].simulation;
      }
    }

    return false;
  },

  addItem() {
    this.setState({ _error: null });
    this.props.onAddItem();
  },

  removeItem() {
    const { list, active, onRemoveItem } = this.props;
    const clusterToDelete = list[active];
    const clusterSimulation = this.clusterHasSimulation(clusterToDelete._id);
    if (clusterSimulation && this.props.simulations[clusterSimulation]) {
      this.setState({ _error: `This cluster is associated with simulation "${this.props.simulations[clusterSimulation].name}"` });
      return;
    } else if (clusterToDelete._id && confirm('Are you sure you want to delete this cluster?')) {
      onRemoveItem(active, clusterToDelete);
    } else if (!clusterToDelete._id) {
      onRemoveItem(active, clusterToDelete);
    }

    this.setState({ _error: null });
  },

  saveItem() {
    const { onUpdateItem, active, list } = this.props;
    this.setState({ _error: null });
    onUpdateItem(active, list[active], true);
  },

  testCluster() {
    const { onTestCluster, list, active } = this.props;
    this.setState({ _error: null });
    onTestCluster(active, list[active]);
  },

  formAction(action) {
    this[action]();
  },

  render() {
    const { active, list, error, buttonsDisabled, presetNames } = this.props;
    const activeData = active < list.length ? list[active] : null;

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
            active={active}
            list={list}
          />
          <div className={ style.content }>
            <ClusterForm
              data={activeData}
              onChange={ this.changeItem }
            />
            <ButtonBar
              visible={!!activeData}
              onAction={ this.formAction }
              error={ error || this.state._error }
              actions={getActions(buttonsDisabled, activeData && activeData.config.ssh.publicKey && activeData.status !== 'running')}
            >
              <PresetSelector
                contents={presetNames}
                onChange={this.presetChange}
                value={''}
              />
            </ButtonBar>
          </div>
        </div>
      </div>);
  },
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  state => {
    const localState = state.preferences.clusters;
    const simulations = state.simulations.mapById;
    const taskflows = Object.keys(state.taskflows.mapById).map((tf) => state.taskflows.mapById[tf]);
    return {
      presetNames: Object.keys(localState.presets || {}),
      active: localState.active,
      list: localState.list,
      buttonsDisabled: localState.pending,
      error: get(state, 'network.error.save_cluster.resp.data.message'),
      taskflows,
      simulations,
    };
  },
  () => {
    return {
      onUpdateItem: (index, cluster, server) => dispatch(Actions.updateCluster(index, cluster, server)),
      onActiveChange: (index) => dispatch(Actions.updateActiveCluster(index)),
      onApplyPreset: (index, presetName) => dispatch(Actions.applyPreset(index, presetName)),
      onAddItem: () => dispatch(Actions.addCluster()),
      onRemoveItem: (index, cluster) => dispatch(Actions.removeCluster(index, cluster)),
      onTestCluster: (index, cluster) => dispatch(Actions.testCluster(index, cluster)),
    };
  }
)(ClusterPrefs);
