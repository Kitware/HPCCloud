// import client           from '../../../network';
import React            from 'react';
import VolumeForm       from './VolumeForm';
import ActiveList       from '../../../panels/ActiveList';
import Toolbar          from '../../../panels/Toolbar';
import ButtonBar        from '../../../panels/ButtonBar';
import EmptyPlaceholder from '../../../panels/EmptyPlaceholder';
import { breadcrumb }   from '..';

// import getNetworkError  from '../../../utils/getNetworkError';

import theme from 'HPCCloudStyle/Theme.mcss';
import style from 'HPCCloudStyle/PageWithMenu.mcss';

// import get             from 'mout/src/object/get';
import { connect }         from 'react-redux';
import * as Actions        from '../../../redux/actions/volumes';
import * as AWSActions     from '../../../redux/actions/aws';
import * as ClusterActions from '../../../redux/actions/clusters';
import * as NetActions     from '../../../redux/actions/network';
import { dispatch }        from '../../../redux';

const volumeBreadCrumb = Object.assign({}, breadcrumb, { active: 3 });

function getActions(disabled, config) {
  if (config.isAttached) {
    return [
      { name: 'detachVolume', label: 'Detach', icon: style.detatchIcon, disabled },
    ];
  } else if (config.isSaved) {
    return [
      { name: 'removeItem', label: 'Delete', icon: style.deleteIcon, disabled },
      { name: 'attachVolume', label: 'Attach', icon: style.attachIcon, disabled },
    ];
  }
  // neither saved nor attached
  return [
    { name: 'removeItem', label: 'Delete', icon: style.deleteIcon, disabled },
    { name: 'saveItem', label: 'Save', icon: style.saveIcon, disabled },
  ];
}

/* eslint-disable no-alert */
const ClusterPrefs = React.createClass({

  displayName: 'Preferences/Volume',

  propTypes: {
    active: React.PropTypes.number,
    presetNames: React.PropTypes.array,
    list: React.PropTypes.array,
    profiles: React.PropTypes.array,
    clusters: React.PropTypes.array,
    error: React.PropTypes.string,
    buttonsDisabled: React.PropTypes.bool,

    onUpdateItem: React.PropTypes.func,
    onActiveChange: React.PropTypes.func,
    onAddItem: React.PropTypes.func,
    onRemoveItem: React.PropTypes.func,
    fetchAWS: React.PropTypes.func,
    fetchVolumes: React.PropTypes.func,
    fetchClusters: React.PropTypes.func,
    attachVolume: React.PropTypes.func,
    invalidateErrors: React.PropTypes.func,
  },

  getDefaultProps() {
    return { list: [], profiles: [], clusters: [] };
  },

  getInitialState() {
    return { _error: null };
  },

  componentDidMount() {
    setImmediate(() => {
      this.props.fetchAWS();
      this.props.fetchClusters();
      this.props.fetchVolumes();
    });
  },

  changeItem(item) {
    const { active, onUpdateItem } = this.props;
    onUpdateItem(active, item);
  },

  activeChange(active) {
    this.setState({ _error: null });
    this.props.onActiveChange(active);
  },

  addItem() {
    if (this.props.error) {
      this.props.invalidateErrors();
    }
    this.setState({ _error: null });
    this.props.onAddItem();
  },

  attachVolume() {
    const { attachVolume, active, list } = this.props;
    attachVolume(list[active]._id, list[active].cluster);
  },

  detachVolume() {
    console.log('unimplemented');
  },

  removeItem(index) {
    const { list, active, onRemoveItem } = this.props;
    const volumeToDelete = list[active];
    if (volumeToDelete._id && confirm('Are you sure you want to delete this volume?')) {
      onRemoveItem(active, volumeToDelete);
    } else {
      onRemoveItem(active, volumeToDelete);
    }
  },

  saveItem() {
    const { onUpdateItem, active, list } = this.props;
    const contents = list[active];
    if (contents._id) {
      this.setState({ _error: 'Volume cannot be modified after it\'s been saved' });
      return;
    } else if (!contents.name) {
      this.setState({ _error: 'Name cannot be empty' });
      return;
    }
    this.setState({ _error: null });
    onUpdateItem(active, list[active], true);
  },

  formAction(action) {
    this[action]();
  },

  render() {
    const { active, list, error } = this.props;
    const activeData = active < list.length ? list[active] : null;

    let content = null;
    if (list && list.length) {
      content = (<div className={ style.content }>
        <VolumeForm
          data={activeData}
          profiles={this.props.profiles}
          clusters={this.props.clusters}
          onChange={ this.changeItem }
        />
        <ButtonBar
          visible={!!activeData}
          onAction={ this.formAction }
          error={ error || this.state._error }
          actions={getActions(false,
            { isAttached: activeData.status === 'in-use', isSaved: activeData.hasOwnProperty('_id') })}
        />
      </div>);
    } else {
      content = (<EmptyPlaceholder phrase={
        <span>
          There are no Volumes available <br />
          You can create some with the <i className={theme.addIcon}></i> above
        </span> }
      />);
    }

    return (
      <div className={ style.rootContainer }>
        <Toolbar breadcrumb={ volumeBreadCrumb } title="Volume"
          actions={[{ name: 'add', icon: style.addIcon }]} onAction={this.addItem}
          hasTabs
        />
        <div className={ style.container }>
          <ActiveList
            className={ style.menu }
            onActiveChange={this.activeChange}
            active={active}
            list={list}
          />
          { content }
        </div>
      </div>);
  },
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  state => {
    const localState = state.preferences;
    const clusters = Object.keys(localState.clusters.mapById).map((id, index) =>
      localState.clusters.mapById[id]
    );
    return {
      active: localState.volumes.active,
      list: localState.volumes.list,
      profiles: localState.aws.list,
      clusters,
    };
  },
  () => {
    return {
      onUpdateItem: (index, volume, server) => dispatch(Actions.updateVolume(index, volume, server)),
      onActiveChange: (index) => dispatch(Actions.updateActiveVolume(index)),
      onAddItem: () => dispatch(Actions.addVolume()),
      onRemoveItem: (index, volume) => dispatch(Actions.removeVolume(index, volume)),
      fetchAWS: () => dispatch(AWSActions.fetchAWSProfiles()),
      fetchClusters: () => dispatch(ClusterActions.fetchClusters()),
      fetchVolumes: () => dispatch(Actions.fetchVolumes()),
      attachVolume: (volumeId, clusterId) => dispatch(Actions.attachVolume(volumeId, clusterId)),
      invalidateErrors: () => dispatch(NetActions.invalidateErrors(['save_volume', 'remove_volume'])),
    };
  }
)(ClusterPrefs);
