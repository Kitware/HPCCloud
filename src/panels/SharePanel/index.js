import React from 'react';

import * as ProjActions from '../../redux/actions/projects';
import * as AuthActions from '../../redux/actions/user';
import * as GroupActions from '../../redux/actions/groups';

import { connect }  from 'react-redux';
import { dispatch } from '../../redux';

import style    from 'HPCCloudStyle/ItemEditor.mcss';

const SharePanel = React.createClass({
  displayName: 'SharePanel',

  propTypes: {
    shareToType: React.PropTypes.oneOf(['users', 'groups']).isRequired,
    shareItem: React.PropTypes.object.isRequired, // project or simulation object
    currentUser: React.PropTypes.object,
    targetMap: React.PropTypes.object,
    fetchUsers: React.PropTypes.func,
    fetchGroups: React.PropTypes.func,
    shareProject: React.PropTypes.func,
    shareSimulation: React.PropTypes.func,
    unShareProject: React.PropTypes.func,
    unShareSimulation: React.PropTypes.func,
  },

  getDefaultProps() {
    return { targetMap: {} };
  },

  getInitialState() {
    return {
      shareIds: [],
      unShareIds: [],
    };
  },

  componentDidMount() {
    if (this.props.shareToType === 'users') {
      this.props.fetchUsers();
    } else {
      this.props.fetchGroups();
    }
  },

  handleChange(e) {
    const which = e.target.dataset.which;
    const options = e.target.options;
    const values = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        values.push(options[i].value);
      }
    }
    this.setState({ [which]: values });
  },

  shareAction(e) {
    let shareIds;
    if (this.props.shareToType === 'users') {
      shareIds = [this.state.shareIds, []];
    } else {
      shareIds = [[], this.state.shareIds];
    }
    if (this.props.shareItem.projectId) {
      this.props.shareSimulation(this.props.shareItem, ...shareIds);
    } else {
      this.props.shareProject(this.props.shareItem, ...shareIds);
    }
    this.setState({ shareIds: [] });
  },

  unShareAction(e) {
    let shareIds;
    if (this.props.shareToType === 'users') {
      shareIds = [this.state.shareIds, []];
    } else {
      shareIds = [[], this.state.shareIds];
    }
    if (this.state.unShareUsers.indexOf(this.props.shareItem.userId) !== -1) {
      console.log('Cannot remove the owner from their own project.');
      return;
    }

    if (this.state.unShareUsers.indexOf(this.props.currentUser._id) !== -1) {
      console.log('You cannot remove yourself from this project');
      return;
    }

    if (this.props.shareItem.projectId) {
      this.props.unShareSimulation(this.props.shareItem, ...shareIds);
    } else {
      this.props.unShareProject(this.props.shareItem, ...shareIds);
    }
    this.setState({ unShareIds: [] });
  },

  render() {
    const hasContents = Object.keys(this.props.targetMap).length;
    const targetKey = this.props.shareToType === 'users' ? 'login' : 'name';
    const targetMembers = this.props.shareItem.access[this.props.shareToType].reduce((prev, cur) => prev.concat([cur.id]), []);
    return (<div>
        <div className={style.group}>
          <label className={style.label}>{ this.props.shareToType === 'users' ? 'User Access' : 'Groups Access'}</label>
          <section className={style.splitView}>
            <div className={style.splitViewItem}>
              <select multiple data-which="shareIds" className={style.input}
                onChange={this.handleChange} value={this.state.shareIds}
              >
                { Object.keys(this.props.targetMap).filter((fId) => targetMembers.indexOf(fId) === -1)
                  .map((_id, i) => <option key={`${_id}_${i}`} value={_id}>{ hasContents ? this.props.targetMap[_id][targetKey] : '' }</option>)
                }
              </select>
              <button onClick={this.shareAction}
                disabled={!this.state.shareIds.length}
                className={style.shareButton}>
                Add
              </button>
            </div>
            <div className={style.splitViewItem}>
              <select multiple data-which="unShareIds" className={style.input}
                onChange={this.handleChange} value={this.state.unShareIds}
              >
                { targetMembers.map((_id, i) => {
                  const name = hasContents ? this.props.targetMap[_id][targetKey] : '';
                  return <option key={`${_id}_${i}`} value={_id}>{ name }</option>;
                }) }
              </select>
              <button onClick={this.unShareAction}
                disabled={!this.state.unShareIds.length}
                className={style.shareButton}>
                Remove
              </button>
            </div>
          </section>
        </div>
      </div>);
  },
});


export default connect(
  (state, props) => ({
    currentUser: state.auth.user,
    targetMap: props.shareToType === 'users' ? state.auth.userMap : state.groups.mapById,
  }),
  () => ({
    fetchUsers: () => dispatch(AuthActions.getUsers()),
    fetchGroups: () => dispatch(GroupActions.getGroups()),
    shareProject: (simulation, users, groups) => dispatch(ProjActions.shareProject(simulation, users, groups)),
    shareSimulation: (simulation, users, groups) => dispatch(ProjActions.shareSimulation(simulation, users, groups)),
    unShareProject: (project, users, groups) => dispatch(ProjActions.unShareProject(project, users, groups)),
    unShareSimulation: (project, users, groups) => dispatch(ProjActions.unShareSimulation(project, users, groups)),
  })
)(SharePanel);
