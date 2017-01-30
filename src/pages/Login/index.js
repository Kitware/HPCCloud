import React    from 'react';
import { Link } from 'react-router';

import style    from 'HPCCloudStyle/Login.mcss';
import layout   from 'HPCCloudStyle/Layout.mcss';

import get          from 'mout/src/object/get';
import { connect }  from 'react-redux';
import { dispatch } from '../../redux';
import { login }    from '../../redux/actions/user';

const Login = React.createClass({

  displayName: 'Login',

  propTypes: {
    error: React.PropTypes.bool,
    onLogin: React.PropTypes.func,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      error: false,
      onLogin: (username, password) => console.log('login', username, '...password'),
    };
  },

  handleSubmit(event) {
    event.preventDefault();
    this.props.onLogin(this.login.value, this.pass.value);
  },

  render() {
    return (
        <div className={layout.textCenter}>
            <div className={style.header}>
                <i className={style.topIcon} />
                <p className={style.subtitle}> Login to HPCCloud</p>
            </div>
            <form className={style.loginForm} onSubmit={this.handleSubmit}>
                <input ref={(c) => {this.login = c;}} className={style.loginInput} type="login" placeholder="login" required />
                <input ref={(c) => {this.pass = c;}} className={style.loginInput} type="password" placeholder="password" required />
                <div>
                    <button className={style.loginButton}>Login <i className={ style.sendIcon } /></button>
                    <div className={style.forgotPassword}>
                        <Link to={'/Forgot'}>Forget password?</Link>
                    </div>
                </div>
                {this.props.error && (
                    <p className={style.errorBox}>Bad login information</p>
                )}
            </form>
        </div>);
  },
});

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state) => {
    return {
      error: !!get(state, 'network.error.user_login') && !get(state, 'network.error.user_login.invalid'),
    };
  },
  () => {
    return {
      onLogin: (username, password) => dispatch(login(username, password)),
    };
  }
)(Login);
