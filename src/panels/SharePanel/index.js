import React from 'react';

import * as ProjActions from '../../redux/actions/projects';
import * as AuthActions from '../../redux/actions/user';

import { connect }  from 'react-redux';
import { dispatch } from '../../redux';

import style    from 'HPCCloudStyle/ItemEditor.mcss';

const SharePanel = React.createClass({
  displayName: 'SharePanel',

  propTypes: {
    userMap: React.PropTypes.object,
    project: React.PropTypes.object,
    onMount: React.PropTypes.func,
    shareProject: React.PropTypes.func,
  },

  getDefaultProps() {
    return { userMap: {} };
  },

  componentDidMount() {
    this.props.onMount();
  },

  render() {
    const hasUsers = Object.keys(this.props.userMap).length;
    const projectUsers = this.props.project.access.users.reduce((prev, cur) => prev.concat([cur.id]), []);
    return (<div>
        <div className={style.group}>
          <label className={style.label}>Access</label>
          <ul>
            { projectUsers.map((_id, i) => {
              const name = hasUsers ? this.props.userMap[_id].login : '';
              return <li key={`${_id}_${i}`}>{ name }<button>Remove</button></li>;
            }) }
          </ul>
        </div>
        <div className={style.group}>
          <label className={style.label}>Share with</label>
          <select>
            { Object.keys(this.props.userMap).filter((userId) => projectUsers.indexOf(userId) === -1)
              .map((userId, i) => <option key={`${userId}_${i}`}>{ hasUsers ? this.props.userMap[userId].login : '' }</option>)
            }
          </select>
          <button>Add</button>
        </div>
      </div>);
  },
});


export default connect(
  (state, props) => ({
    userMap: state.auth.userMap,
  }),
  () => ({
    onMount: () => dispatch(AuthActions.getUsers()),
    shareProject: (userId) => dispatch(ProjActions.shareProject(userId)),
  })
)(SharePanel);
