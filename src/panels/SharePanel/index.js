import React from 'react';

import * as ProjActions from '../../redux/actions/projects';
import * as AuthActions from '../../redux/actions/user';

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
    onMount: React.PropTypes.func,
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
    this.props.onMount();
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
    const hasUsers = Object.keys(this.props.targetMap).length;
    const projectUsers = this.props.shareItem.access.users.reduce((prev, cur) => prev.concat([cur.id]), []);
    return (<div>
        <div className={style.group}>
          <label className={style.label}>{ this.props.shareToType === 'users' ? 'User Access' : 'Groups Access'}</label>
          <section className={style.splitView}>
            <div className={style.splitViewItem}>
              <select multiple data-which="shareIds" className={style.input}
                onChange={this.handleChange} value={this.state.shareIds}
              >
                { Object.keys(this.props.targetMap).filter((userId) => projectUsers.indexOf(userId) === -1)
                  .map((userId, i) => <option key={`${userId}_${i}`} value={userId}>{ hasUsers ? this.props.targetMap[userId].login : '' }</option>)
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
                { projectUsers.map((_id, i) => {
                  const name = hasUsers ? this.props.targetMap[_id].login : '';
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
  (state, props) => {
    return {
      currentUser: state.auth.user,
      targetMap: this.props.shareToType === 'users' ? state.auth.userMap : state.groups.mapById,
    };
  },
  () => ({
    fetchUsers: () => dispatch(AuthActions.getUsers()),
    fetchGroups: () => dispatch(GroupActions.getGroups()),
    shareProject: (simulation, users, groups) => dispatch(ProjActions.shareProject(simulation, users, groups)),
    shareSimulation: (simulation, users, groups) => dispatch(ProjActions.shareSimulation(simulation, users, groups)),
    unShareProject: (project, users, groups) => dispatch(ProjActions.unShareProject(project, users, groups)),
    unShareSimulation: (project, users, groups) => dispatch(ProjActions.unShareSimulation(project, users, groups)),
  })
)(SharePanel);
