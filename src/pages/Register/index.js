import React  from 'react';
import style  from 'HPCCloudStyle/Login.mcss';

import get          from 'mout/src/object/get';
import { connect }  from 'react-redux';
import { dispatch } from '../../redux';
import { register } from '../../redux/actions/user';

const Register = React.createClass({

  displayName: 'Register',

  propTypes: {
    error: React.PropTypes.string,
    onRegister: React.PropTypes.func,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      error: null,
      onRegister: (user) => console.log('register', user),
    };
  },

  getInitialState() {
    return {
      password: '',
      confirm: '',
    };
  },

  passwordChange(e) {
    var newState = { password: e.target.value };
    this.passwordCheck(e.target.value, this.state.confirm, newState);
    this.setState(newState);
  },

  confirmChange(e) {
    var newState = { confirm: e.target.value };
    this.passwordCheck(this.state.password, e.target.value, newState);
    this.setState(newState);
  },

  passwordCheck(password, confirm, obj) {
    if (password !== confirm) {
      obj.error = 'passwords do not match';
    } else {
      obj.error = false;
    }
  },

  handleSubmit(event) {
    event.preventDefault();
    const user = {};
    ['login', 'firstName', 'lastName', 'email', 'password'].forEach(key => {
      user[key] = this.refs[key].value;
    });
    this.props.onRegister(user);
  },

  render() {
    return (
      <center>
        <form className={style.loginForm} onSubmit={this.handleSubmit}>
          <input
            className={style.loginInput}
            ref="firstName"
            type="text"
            placeholder="firstName"
            required
          />
          <input
            className={style.loginInput}
            ref="lastName"
            type="text"
            placeholder="lastName"
            required
          />
          <input
            className={style.loginInput}
            ref="login"
            type="text"
            placeholder="login"
            onChange={this.resetError}
            required
          />
          <input
            className={style.loginInput}
            ref="email"
            type="email"
            placeholder="email"
            onChange={this.resetError}
            required
          />
          <input
            className={style.loginInput}
            ref="password"
            type="password"
            value={this.state.password}
            onChange={this.passwordChange}
            placeholder="password"
            required
          />
          <input
            className={style.loginInput}
            ref="confirm"
            type="password"
            value={this.state.confirm}
            onChange={this.confirmChange}
            placeholder="confirm password"
            required
          />
          <div>
              <button
                className={style.loginButton}
              >Register</button>
          </div>
          {(!!this.props.error ? (
              <p className={style.warningBox}>{this.props.error}</p>
          ) : null)}
        </form>
      </center>);
  },
});

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  state => {
    return {
      error: get(state, 'network.error.user_register.resp.data.message'),
    };
  },
  () => {
    return {
      onRegister: ({ firstName, lastName, login, email, password }) => dispatch(register(firstName, lastName, login, email, password)),
    };
  }
)(Register);

