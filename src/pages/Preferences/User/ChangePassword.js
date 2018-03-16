import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import get from 'mout/src/object/get';

import style from 'HPCCloudStyle/ItemEditor.mcss';

import ButtonBar from '../../../panels/ButtonBar';

import getNetworkError from '../../../utils/getNetworkError';

import * as Actions from '../../../redux/actions/user';
import { dispatch } from '../../../redux';

function getActions(icon, disabled = false) {
  return [
    {
      name: 'changePass',
      label: 'Change password',
      icon,
      disabled,
    },
  ];
}

function passwordCheck(password, confirm, obj) {
  if (password !== confirm) {
    obj.error = 'passwords do not match';
  } else {
    obj.error = null;
  }
}

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      oldPassword: '',
      password: '',
      confirm: '',
    };

    this.oldPasswordChange = this.oldPasswordChange.bind(this);
    this.passwordChange = this.passwordChange.bind(this);
    this.confirmChange = this.confirmChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  oldPasswordChange(event) {
    const newState = { oldPassword: event.target.value };
    this.setState(newState);
  }

  passwordChange(event) {
    const newState = { password: event.target.value };
    passwordCheck(event.target.value, this.state.confirm, newState);
    this.setState(newState);
  }

  confirmChange(event) {
    const newState = { confirm: event.target.value };
    passwordCheck(this.state.password, event.target.value, newState);
    this.setState(newState);
  }

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
  }

  render() {
    const { oldPassword, password, error } = this.state;
    const canClick = oldPassword.length > 0 && password.length > 0 && !error;
    return (
      <div className={this.props.className}>
        <form onSubmit={this.handleSubmit}>
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
          onAction={this.handleSubmit}
          error={this.props.error}
          actions={getActions(this.props.icon, !canClick)}
        />
      </div>
    );
  }
}

ChangePassword.propTypes = {
  icon: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.string,
  onPasswordChange: PropTypes.func.isRequired,
};

ChangePassword.defaultProps = {
  icon: '',
  error: '',
  className: '',
};

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state) => {
    const error = getNetworkError(state, 'user_updatePassword');
    const success = !!get(state, 'network.success.user_updatePassword');
    return {
      error,
      icon: success ? style.validIcon : '',
    };
  },
  () => {
    return {
      onPasswordChange: (old, newPass) =>
        dispatch(Actions.changePassword(old, newPass)),
    };
  }
)(ChangePassword);
