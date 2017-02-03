import React from 'react';

import style    from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({
  displayName: 'SharePanel',

  propTypes: {
    users: React.PropTypes.array,
    project: React.PropTypes.object,
  },

  getDefaultProps() {
    return { users: [] };
  },

  render() {
    const projectUsers = this.props.project.access.users.reduce((prev, cur) => prev.concat(cur._id), []);
    return (<div>
        <div className={style.group}>
          <label className={style.label}>Access</label>
          <ul>
            { projectUsers((_id) => {
              const name = this.props.users[_id].login;
              return <li key={_id}>{ name }</li>;
            }) }
          </ul>
        </div>
        <div className={style.group}>
          <label className={style.label}>Share with</label>
          <select>
            { Object.keys(this.props.users).filter((userId) => projectUsers.indexOf(userId) === -1)
              .map(userId => <option key={userId}>{ this.props.users[userId].login }</option>) }
          </select>
          <button>Add</button>
        </div>
      </div>);
  },
});
