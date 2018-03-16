import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import style from 'HPCCloudStyle/Login.mcss';

import getNetworkError from '../../utils/getNetworkError';
import { dispatch } from '../../redux';
import { register } from '../../redux/actions/user';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      password: '',
      confirm: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.passwordChange = this.passwordChange.bind(this);
    this.confirmChange = this.confirmChange.bind(this);
    this.passwordCheck = this.passwordCheck.bind(this);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.error !== this.props.error) {
      this.setState({ error: newProps.error });
    }
  }

  passwordChange(e) {
    const newState = { password: e.target.value };
    this.passwordCheck(e.target.value, this.state.confirm, newState);
  }

  confirmChange(e) {
    const newState = { confirm: e.target.value };
    this.passwordCheck(this.state.password, e.target.value, newState);
  }

  passwordCheck(password, confirm, newState) {
    if (password !== confirm) {
      newState.error = 'Passwords do not match';
    } else {
      newState.error = false;
    }
    this.setState(newState);
  }

  handleSubmit(event) {
    event.preventDefault();
    const user = {};
    ['login', 'firstName', 'lastName', 'email', 'password'].forEach((key) => {
      user[key] = this[key].value;
    });
    this.props.onRegister(user);
  }

  render() {
    return (
      <center>
        <form className={style.loginForm} onSubmit={this.handleSubmit}>
          <input
            className={style.loginInput}
            ref={(c) => {
              this.firstName = c;
            }}
            type="text"
            placeholder="firstName"
            required
          />
          <input
            className={style.loginInput}
            ref={(c) => {
              this.lastName = c;
            }}
            type="text"
            placeholder="lastName"
            required
          />
          <input
            className={style.loginInput}
            ref={(c) => {
              this.email = c;
            }}
            type="email"
            placeholder="email"
            onChange={this.resetError}
            required
          />
          <input
            className={style.loginInput}
            ref={(c) => {
              this.login = c;
            }}
            type="text"
            placeholder="login"
            onChange={this.resetError}
            required
          />
          <input
            className={style.loginInput}
            ref={(c) => {
              this.password = c;
            }}
            type="password"
            value={this.state.password}
            onChange={this.passwordChange}
            placeholder="password"
            required
          />
          <input
            className={style.loginInput}
            ref={(c) => {
              this.confirm = c;
            }}
            type="password"
            value={this.state.confirm}
            onChange={this.confirmChange}
            placeholder="confirm password"
            required
          />
          <div>
            <button className={style.loginButton}>Register</button>
          </div>
          {this.state.error ? (
            <p className={style.warningBox}>{this.state.error}</p>
          ) : null}
        </form>
      </center>
    );
  }
}

Register.propTypes = {
  error: PropTypes.string,
  onRegister: PropTypes.func,
};

Register.defaultProps = {
  error: '',
  onRegister: (user) => console.log('register', user),
};

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state) => {
    return {
      error: getNetworkError(state, 'user_register'),
    };
  },
  () => {
    return {
      onRegister: ({ firstName, lastName, login, email, password }) =>
        dispatch(register(firstName, lastName, login, email, password)),
    };
  }
)(Register);
