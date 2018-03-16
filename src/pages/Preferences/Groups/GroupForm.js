import React from 'react';
import PropTypes from 'prop-types';

import style from 'HPCCloudStyle/ItemEditor.mcss';

import set from 'mout/src/object/set';
import deepClone from 'mout/src/lang/deepClone';

export default class GroupForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shareUsers: [],
      unShareUsers: [],
    };

    this.userAdd = this.userAdd.bind(this);
    this.userRemove = this.userRemove.bind(this);
    this.handleUserChange = this.handleUserChange.bind(this);
    this.formChange = this.formChange.bind(this);
  }

  userAdd() {
    if (this.props.onUserAdd) {
      this.props.onUserAdd(this.state.shareUsers);
      this.setState({ shareUsers: [] });
    }
  }

  userRemove() {
    if (this.props.onUserRemove) {
      this.props.onUserRemove(this.state.unShareUsers);
      this.setState({ unShareUsers: [] });
    }
  }

  handleUserChange(e) {
    const which = e.target.dataset.which;
    const options = e.target.options;
    const values = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        values.push(options[i].value);
      }
    }
    this.setState({ [which]: values });
  }

  formChange(event) {
    const propName = event.target.dataset.key;
    const value = event.target.value;
    if (this.props.onChange) {
      const data = deepClone(this.props.data);
      set(data, propName, value);
      this.props.onChange(data);
    }
  }

  render() {
    const groupUsersArray = this.props.groupUsers.map((el) => el.id);
    return (
      <div>
        <section className={style.group}>
          <label className={style.label}>Name</label>
          <input
            className={style.input}
            type="text"
            value={this.props.data.name}
            data-key="name"
            onChange={this.formChange}
            required
          />
        </section>
        <section className={style.group}>
          <label className={style.label}>Description</label>
          <textarea
            className={style.input}
            data-key="description"
            rows="5"
            onChange={this.formChange}
            value={this.props.data.description}
          />
        </section>
        <section
          className={style.group}
          style={{ display: this.props.data._id ? null : 'none' }}
        >
          <label className={style.label}>Users</label>
          <section className={style.splitView}>
            <div className={style.splitViewItem}>
              <select
                className={style.input}
                data-which="shareUsers"
                multiple
                onChange={this.handleUserChange}
                value={this.state.shareUsers}
              >
                {Object.keys(this.props.users)
                  .filter((id) => groupUsersArray.indexOf(id) === -1)
                  .map((id, ind) => (
                    <option key={id} value={id}>
                      {this.props.users[id].login}
                    </option>
                  ))}
              </select>
              <button
                className={style.shareButton}
                onClick={this.userAdd}
                disabled={!this.state.shareUsers.length}
              >
                Add
              </button>
            </div>
            <div className={style.splitViewItem}>
              <select
                className={style.input}
                data-which="unShareUsers"
                multiple
                onChange={this.handleUserChange}
                value={this.state.unShareUsers}
              >
                {this.props.groupUsers.map((el, ind) => (
                  <option key={`${el.id}_${ind}`} value={el.id}>
                    {el.login}
                  </option>
                ))}
              </select>
              <button
                className={style.shareButton}
                onClick={this.userRemove}
                disabled={!this.state.unShareUsers.length}
              >
                Remove
              </button>
            </div>
          </section>
        </section>
      </div>
    );
  }
}

GroupForm.propTypes = {
  users: PropTypes.object,
  groupUsers: PropTypes.array,
  data: PropTypes.object,
  onChange: PropTypes.func,
  onUserAdd: PropTypes.func,
  onUserRemove: PropTypes.func,
};

GroupForm.defaultProps = {
  users: {},
  data: {},
  groupUsers: [],
  onChange: undefined,
  onUserAdd: undefined,
  onUserRemove: undefined,
};
