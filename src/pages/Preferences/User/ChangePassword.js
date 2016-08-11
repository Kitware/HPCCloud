import React        from 'react';
import ButtonBar    from '../../../panels/ButtonBar';

import style        from 'HPCCloudStyle/ItemEditor.mcss';

import get          from 'mout/src/object/get';
import getNetworkError from '../../../utils/getNetworkError';
import { connect }  from 'react-redux';
import * as Actions from '../../../redux/actions/user';
import { dispatch } from '../../../redux';

function getActions(icon, disabled = false) {
  return [{
    name: 'changePass',
    label: 'Change password',
    icon,
    disabled,
  }];
}

const ChangePassword = React.createClass({

  displayName: 'User/ChangePassword',

  propTypes: {
    icon: React.PropTypes.string,
    className: React.PropTypes.string,
    error: React.PropTypes.string,
    onPasswordChange: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      error: '',
    };
  },

  getInitialState() {
    return {
      oldPassword: '',
      password: '',
      confirm: '',
    };
  },

  oldPasswordChange(event) {
    var newState = { oldPassword: event.target.value };
    this.setState(newState);
  },

  passwordChange(event) {
    var newState = { password: event.target.value };
    this.passwordCheck(event.target.value, this.state.confirm, newState);
    this.setState(newState);
  },

  confirmChange(event) {
    var newState = { confirm: event.target.value };
    this.passwordCheck(this.state.password, event.target.value, newState);
    this.setState(newState);
  },

  passwordCheck(password, confirm, obj) {
    if (password !== confirm) {
      obj.error = 'passwords do not match';
    } else {
      obj.error = null;
    }
  },

  handleSubmit(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    const { oldPassword, password } = this.state;
    this.props.onPasswordChange(oldPassword, password);
    this.setState({
      oldPassword: '',
      password: '',
      confirm: '',
    });
  },

  render() {
    const { oldPassword, password, error } = this.state;
    const canClick = (oldPassword.length > 0 && password.length > 0 && !error);
    return (
      <div className={ this.props.className }>
        <form onSumbit={this.handleSubmit}>
          <section className={style.group}>
            <label className={style.label}>Password</label>
            <input
              className={style.input}
              type="password"
              value={this.state.oldPassword}
              onChange={this.oldPasswordChange}
              placeholder="old password"
              required
            />
          </section>
          <section className={style.group}>
            <label className={style.label}>New password</label>
            <input
              className={style.input}
              type="password"
              value={this.state.password}
              onChange={this.passwordChange}
              placeholder="new password"
              required
            />
          </section>
          <section className={style.group}>
            <label className={style.label}>Confirm password</label>
            <input
              className={style.input}
              type="password"
              value={this.state.confirm}
              onChange={this.confirmChange}
              placeholder="confirm password"
              required
            />
          </section>
        </form>
        <ButtonBar
          onAction={ this.handleSubmit }
          error={ this.props.error }
          actions={getActions(this.props.icon, !canClick)}
        />
      </div>);
  },
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  state => {
    const error = getNetworkError(state, 'user_updatePassword');
    const success = !!get(state, 'network.success.user_updatePassword');
    return {
      error,
      icon: success ? style.validIcon : '',
    };
  },
  () => {
    return {
      onPasswordChange: (old, newPass) => dispatch(Actions.changePassword(old, newPass)),
    };
  }
)(ChangePassword);
