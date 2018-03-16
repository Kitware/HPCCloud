import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { Link } from 'react-router';

import theme from 'HPCCloudStyle/Theme.mcss';
import style from 'HPCCloudStyle/PageWithMenu.mcss';

import VolumeForm from './VolumeForm';
import ActiveList from '../../../panels/ActiveList';
import Toolbar from '../../../panels/Toolbar';
import ButtonBar from '../../../panels/ButtonBar';
import EmptyPlaceholder from '../../../panels/EmptyPlaceholder';
import { breadcrumb } from '..';
import get from '../../../utils/get';

import * as Actions from '../../../redux/actions/volumes';
import * as AWSActions from '../../../redux/actions/aws';
import * as ClusterActions from '../../../redux/actions/clusters';
import * as NetActions from '../../../redux/actions/network';
import { dispatch } from '../../../redux';

const volumeBreadCrumb = Object.assign({}, breadcrumb, { active: 3 });

function getActions(disabled, config) {
  if (config.isAttached) {
    return [];
  } else if (config.isSaved) {
    return [
      { name: 'removeItem', label: 'Delete', icon: style.deleteIcon, disabled },
    ];
  }
  // neither saved nor attached
  return [
    { name: 'removeItem', label: 'Delete', icon: style.deleteIcon, disabled },
    { name: 'saveItem', label: 'Save', icon: style.saveIcon, disabled },
  ];
}

/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
class ClusterPrefs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      _error: null,
    };

    this.changeItem = this.changeItem.bind(this);
    this.activeChange = this.activeChange.bind(this);
    this.addItem = this.addItem.bind(this);
    this.attachVolume = this.attachVolume.bind(this);
    this.detachVolume = this.detachVolume.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.saveItem = this.saveItem.bind(this);
    this.formAction = this.formAction.bind(this);
  }

  componentDidMount() {
    setImmediate(() => {
      this.props.fetchAWS();
      this.props.fetchClusters();
      this.props.fetchVolumes();
    });
  }

  changeItem(item) {
    const { active, onUpdateItem } = this.props;
    onUpdateItem(active, item);
  }

  activeChange(active) {
    this.setState({ _error: null });
    this.props.onActiveChange(active);
  }

  addItem() {
    if (this.props.error) {
      this.props.invalidateErrors();
    }
    this.setState({ _error: null });
    this.props.onAddItem(this.props.profiles[0]._id);
  }

  attachVolume() {
    const { attachVolume, active, list } = this.props;
    attachVolume(list[active]._id, list[active].cluster);
  }

  detachVolume() {
    this.setState({ _error: 'Detach volume is not implemented' });
    console.log('unimplemented');
  }

  removeItem(index) {
    const { list, active, onRemoveItem } = this.props;
    const volumeToDelete = list[active];
    if (
      volumeToDelete._id &&
      confirm('Are you sure you want to delete this volume?')
    ) {
      onRemoveItem(active, volumeToDelete);
    } else if (!volumeToDelete._id) {
      onRemoveItem(active, volumeToDelete);
    }
    this.setState({ _error: null });
  }

  saveItem() {
    const { onUpdateItem, active, list } = this.props;
    const contents = list[active];
    if (contents._id) {
      this.setState({
        _error: "Volume cannot be modified after it's been saved",
      });
      return;
    } else if (!contents.name) {
      this.setState({ _error: 'Name cannot be empty' });
      return;
    }
    this.setState({ _error: null });
    onUpdateItem(active, list[active], true);
  }

  formAction(action) {
    this[action]();
  }

  render() {
    const { active, list, error } = this.props;
    const activeData = active < list.length ? list[active] : null;

    let content = null;
    if (list && list.length) {
      content = (
        <div className={style.content}>
          <VolumeForm
            data={activeData}
            profiles={this.props.profiles}
            clusters={this.props.clusters}
            onChange={this.changeItem}
          />
          <ButtonBar
            visible={!!activeData}
            onAction={this.formAction}
            error={error || this.state._error}
            actions={getActions(false, {
              isAttached: activeData.status === 'in-use',
              isSaved: get(activeData, '_id'),
            })}
          />
        </div>
      );
    } else if (!this.props.profiles.length) {
      content = (
        <EmptyPlaceholder
          phrase={
            <span>
              AWS Profile required to create volumes <br />
              Create some under the{' '}
              <Link to="/Preferences/AWS">
                <span>AWS Profiles preferences page</span>
              </Link>.
            </span>
          }
        />
      );
    } else {
      content = (
        <EmptyPlaceholder
          phrase={
            <span>
              There are no Volumes available <br />
              You can create some with the <i className={theme.addIcon} /> above
            </span>
          }
        />
      );
    }

    let actions = [];
    if (this.props.profiles.length) {
      actions = [{ name: 'add', icon: style.addIcon }];
    }

    return (
      <div className={style.rootContainer}>
        <Toolbar
          breadcrumb={volumeBreadCrumb}
          title="Volume"
          actions={actions}
          onAction={this.addItem}
          hasTabs
        />
        <div className={style.container}>
          <ActiveList
            className={style.menu}
            onActiveChange={this.activeChange}
            active={active}
            list={list}
          />
          {content}
        </div>
      </div>
    );
  }
}

ClusterPrefs.propTypes = {
  active: PropTypes.number,
  list: PropTypes.array,
  profiles: PropTypes.array,
  clusters: PropTypes.array,
  error: PropTypes.string,

  onUpdateItem: PropTypes.func.isRequired,
  onActiveChange: PropTypes.func.isRequired,
  onAddItem: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  fetchAWS: PropTypes.func.isRequired,
  fetchVolumes: PropTypes.func.isRequired,
  fetchClusters: PropTypes.func.isRequired,
  attachVolume: PropTypes.func.isRequired,
  invalidateErrors: PropTypes.func.isRequired,
};

ClusterPrefs.defaultProps = {
  active: 0,
  list: [],
  profiles: [],
  clusters: [],

  error: undefined,
};

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state) => {
    const localState = state.preferences;
    const clusters = Object.keys(localState.clusters.mapById).map(
      (id, index) => localState.clusters.mapById[id]
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
      onUpdateItem: (index, volume, server) =>
        dispatch(Actions.updateVolume(index, volume, server)),
      onActiveChange: (index) => dispatch(Actions.updateActiveVolume(index)),
      onAddItem: (profileId) => dispatch(Actions.addVolume(profileId)),
      onRemoveItem: (index, volume) =>
        dispatch(Actions.removeVolume(index, volume)),
      fetchAWS: () => dispatch(AWSActions.fetchAWSProfiles()),
      fetchClusters: () => dispatch(ClusterActions.fetchClusters()),
      fetchVolumes: () => dispatch(Actions.fetchVolumes()),
      attachVolume: (volumeId, clusterId) =>
        dispatch(Actions.attachVolume(volumeId, clusterId)),
      invalidateErrors: () =>
        dispatch(NetActions.invalidateErrors(['save_volume', 'remove_volume'])),
    };
  }
)(ClusterPrefs);
