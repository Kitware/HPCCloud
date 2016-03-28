import React    from 'react';
import style    from 'HPCCloudStyle/Login.mcss';
import layout   from 'HPCCloudStyle/Layout.mcss';

import get                from 'mout/src/object/get';
import { connect }        from 'react-redux';
import { forgetPassword } from '../../redux/actions/user';
import { dispatch }       from '../../redux';

const ForgotPassword = React.createClass({

  displayName: 'ForgotPassword',

  propTypes: {
    error: React.PropTypes.string,
    success: React.PropTypes.string,
    onResetPassword: React.PropTypes.func,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      error: null,
      success: null,
      onResetPassword: () => {},
    };
  },

  handleSubmit(event) {
    event.preventDefault();
    this.props.onResetPassword(this.refs.email.value);
  },

  render() {
    return (
      <div className={layout.textCenter}>
          <div className={style.header}>
              <i className={ style.forgetCloudIcon }></i>
              <p className={style.subtitle}> Forget your password</p>
          </div>
          <form className={style.loginForm} onSubmit={this.handleSubmit}>
              <input ref="email" className={style.loginInput} type="email" placeholder="email" required />
              <div>
                  <button className={style.loginButton}>Send <i className={ style.sendIcon }></i></button>
              </div>
              {this.props.error && (
                  <p className={style.errorBox}>{this.props.error}</p>
              )}
              {this.props.success && (
                  <p className={style.successBox}>{this.props.success}</p>
              )}
          </form>
      </div>);
  },
});

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  state => {
    return {
      error: get(state, 'network.error.user_forget.resp.data.message'),
      success: get(state, 'network.success.user_forget.resp.data.message'),
    };
  },
  () => {
    return {
      onResetPassword: (email) => dispatch(forgetPassword(email)),
    };
  }
)(ForgotPassword);
