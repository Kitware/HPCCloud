import ActiveList       from '../../../panels/ActiveList';
import Toolbar          from '../../../panels/Toolbar';
import GroupForm      from './GroupForm';
import EmptyPlaceholder from '../../../panels/EmptyPlaceholder';
import ButtonBar        from '../../../panels/ButtonBar';
import React            from 'react';
import { breadcrumb }   from '..';
import getNetworkError  from '../../../utils/getNetworkError';

import theme from 'HPCCloudStyle/Theme.mcss';
import style from 'HPCCloudStyle/PageWithMenu.mcss';

import { connect }      from 'react-redux';
import * as Actions     from '../../../redux/actions/groups';
import * as UserActions from '../../../redux/actions/user';
import * as NetActions  from '../../../redux/actions/network';
import { dispatch }     from '../../../redux';

const GroupPrefs = React.createClass({
  displayName: 'Preferences/Groups',

  propTypes: {
    active: React.PropTypes.number,
    list: React.PropTypes.array,
    groups: React.PropTypes.object,
    usersByGroup: React.PropTypes.object,
    users: React.PropTypes.object,
    user: React.PropTypes.object,
    error: React.PropTypes.string,

    onAddItem: React.PropTypes.func,
    onSaveItem: React.PropTypes.func,
    onUpdateItem: React.PropTypes.func,
    onRemoveItem: React.PropTypes.func,
    onUpdateRemoteItem: React.PropTypes.func,
    onActiveChange: React.PropTypes.func,
    onGetGroupUsers: React.PropTypes.func,
    getGroups: React.PropTypes.func,
    getUsers: React.PropTypes.func,
    addToGroup: React.PropTypes.func,
    removeFromGroup: React.PropTypes.func,
  },

  componentDidMount() {
    this.props.getGroups();
    this.props.getUsers();
  },

  formAction(action) {
    this[action]();
  },

  removeItem() {
    if (!confirm('Are you sure you want to delete this group?')) {
      return;
    }
    const { list, active, onRemoveItem } = this.props;
    const groupToDelete = list[active];
    onRemoveItem(active, groupToDelete);
  },

  saveItem() {
    const { list, active, onSaveItem } = this.props;
    onSaveItem(active, list[active]);
  },

  changeItem(item) {
    const { active, onUpdateItem } = this.props;
    onUpdateItem(active, item);
  },

  activeChange(active) {
    this.props.onActiveChange(active);
    if (this.props.list[active]._id) {
      this.props.onGetGroupUsers(this.props.list[active]._id);
    }
  },

  addUsers(users) {
    const { active, list } = this.props;
    const activeData = active < list.length ? list[active] : null;
    if (activeData) {
      this.props.addToGroup(activeData._id, users);
    }
  },

  removeUsers(users) {
    const { active, list } = this.props;
    const activeData = active < list.length ? list[active] : null;
    if (activeData) {
      this.props.removeFromGroup(activeData._id, users);
    }
  },

  render() {
    const clusterBreadCrumb = breadcrumb(this.props.user, 'Groups');
    const { active, list } = this.props;
    const activeData = active < list.length ? list[active] : null;
    const actions = [{ name: 'removeItem', label: 'Delete Group', icon: style.deleteIcon, disabled: false }];
    let groupUsers = [];
    if (activeData && activeData._id === undefined) {
      actions.push({ name: 'saveItem', label: 'Save Group', icon: style.saveIcon, disabled: false });
    } else if (activeData && activeData._id) {
      groupUsers = this.props.usersByGroup[activeData._id];
    }

    let content = null;
    if (list && list.length) {
      content = (<div className={ style.content }>
        <GroupForm data={activeData}
          onChange={ this.changeItem }
          users={this.props.users}
          groupUsers={groupUsers}
          onUserAdd={this.addUsers}
          onUserRemove={this.removeUsers}
        />
        <hr />
        <ButtonBar
          visible={!!activeData}
          onAction={ this.formAction }
          error={ this.props.error }
          actions={actions}
        />
      </div>);
    } else {
      content = (<EmptyPlaceholder phrase={
        <span>
          There are no Groups available <br />
          You can create some with the <i className={theme.addIcon} /> above
        </span> }
      />);
    }

    return (
      <div className={ style.rootContainer }>
        <Toolbar breadcrumb={ clusterBreadCrumb } title="Groups"
          actions={[{ name: 'add', icon: style.addIcon }]} onAction={this.props.onAddItem}
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

export default connect(
  (state) => {
    const localState = state.groups;
    return {
      active: localState.active,
      list: localState.list,
      groups: localState.mapById,
      usersByGroup: localState.usersByGroup,
      users: state.auth.userMap,
      user: state.auth.user,
      error: getNetworkError(state, ['save_group', 'remove_group']),
    };
  },
  () => ({
    getGroups: () => dispatch(Actions.getGroups()),
    getUsers: () => dispatch(UserActions.getUsers()),
    invalidateErrors: () => dispatch(NetActions.invalidateErrors(['save_group', 'remove_group'])),

    onAddItem: () => dispatch(Actions.addGroup()),
    onActiveChange: (index) => dispatch(Actions.updateActiveGroup(index)),
    onGetGroupUsers: (id) => dispatch(Actions.getGroupUsers(id)),
    onSaveItem: (index, group) => dispatch(Actions.saveGroup(index, group)),
    onUpdateItem: (index, group) => dispatch(Actions.updateGroup(index, group)),
    onRemoveItem: (index, group) => dispatch(Actions.deleteGroup(index, group)),
    addToGroup: (groupId, users) => dispatch(Actions.addToGroup(groupId, users)),
    removeFromGroup: (groupId, users) => dispatch(Actions.removeFromGroup(groupId, users)),
  })
)(GroupPrefs);
