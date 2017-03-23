import React from 'react';

import * as ProjActions from '../../redux/actions/projects';
import * as AuthActions from '../../redux/actions/user';

import { connect }  from 'react-redux';
import { dispatch } from '../../redux';

import style    from 'HPCCloudStyle/ItemEditor.mcss';

const SharePanel = React.createClass({
  displayName: 'SharePanel',

  propTypes: {
    currentUser: React.PropTypes.object,
    userMap: React.PropTypes.object,
    shareItem: React.PropTypes.object, // project or simulation object
    onMount: React.PropTypes.func,
    shareProject: React.PropTypes.func,
    shareSimulation: React.PropTypes.func,
    unShareProject: React.PropTypes.func,
    unShareSimulation: React.PropTypes.func,
  },

  getDefaultProps() {
    return { userMap: {} };
  },

  getInitialState() {
    return {
      shareUsers: [],
      unShareUsers: [],
      shareGroups: [],
      unShareGroups: [] };
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
    if (this.props.shareItem.projectId) {
      this.props.shareSimulation(this.props.shareItem,
        this.state.shareUsers, this.state.shareGroups);
    } else {
      this.props.shareProject(this.props.shareItem,
        this.state.shareUsers, this.state.shareGroups);
    }
    this.setState({ shareUsers: [], shareGroups: [] });
  },

  unShareAction(e) {
    if (this.state.unShareUsers.indexOf(this.props.shareItem.userId) !== -1) {
      console.log('Cannot remove the owner from their own project.');
      return;
    }

    if (this.state.unShareUsers.indexOf(this.props.currentUser._id) !== -1) {
      console.log('You cannot remove yourself from this project');
      return;
    }

    if (this.props.shareItem.projectId) {
      this.props.unShareSimulation(this.props.shareItem,
        this.state.unShareUsers, this.state.unShareGroups);
    } else {
      this.props.unShareProject(this.props.shareItem,
        this.state.unShareUsers, this.state.unShareGroups);
    }
    this.setState({ unShareUsers: [], unShareGroups: [] });
  },

  render() {
    const hasUsers = Object.keys(this.props.userMap).length;
    const projectUsers = this.props.shareItem.access.users.reduce((prev, cur) => prev.concat([cur.id]), []);
    return (<div>
        <div className={style.group}>
          <label className={style.label}>User Access</label>
          <section className={style.splitView}>
            <div className={style.splitViewItem}>
              <select multiple data-which="shareUsers" className={style.input}
                onChange={this.handleChange} value={this.state.shareUsers}
              >
                { Object.keys(this.props.userMap).filter((userId) => projectUsers.indexOf(userId) === -1)
                  .map((userId, i) => <option key={`${userId}_${i}`} value={userId}>{ hasUsers ? this.props.userMap[userId].login : '' }</option>)
                }
              </select>
              <button onClick={this.shareAction}
                disabled={!this.state.shareUsers.length}
                className={style.shareButton}>
                Add
              </button>
            </div>
            <div className={style.splitViewItem}>
              <select multiple data-which="unShareUsers" className={style.input}
                onChange={this.handleChange} value={this.state.unShareUsers}
              >
                { projectUsers.map((_id, i) => {
                  const name = hasUsers ? this.props.userMap[_id].login : '';
                  return <option key={`${_id}_${i}`} value={_id}>{ name }</option>;
                }) }
              </select>
              <button onClick={this.unShareAction}
                disabled={!this.state.unShareUsers.length}
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
    userMap: state.auth.userMap,
  }),
  () => ({
    onMount: () => dispatch(AuthActions.getUsers()),
    shareProject: (simulation, users, groups) => dispatch(ProjActions.shareProject(simulation, users, groups)),
    shareSimulation: (simulation, users, groups) => dispatch(ProjActions.shareSimulation(simulation, users, groups)),
    unShareProject: (project, users, groups) => dispatch(ProjActions.unShareProject(project, users, groups)),
    unShareSimulation: (project, users, groups) => dispatch(ProjActions.unShareSimulation(project, users, groups)),
  })
)(SharePanel);
