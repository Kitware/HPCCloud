import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import get from 'mout/src/object/get';

import style from 'HPCCloudStyle/Login.mcss';
import layout from 'HPCCloudStyle/Layout.mcss';

import getNetworkError from '../../utils/getNetworkError';

import { forgetPassword } from '../../redux/actions/user';
import { dispatch } from '../../redux';

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onResetPassword(this.email.value);
  }

  render() {
    return (
      <div className={layout.textCenter}>
        <div className={style.header}>
          <i className={style.forgetCloudIcon} />
          <p className={style.subtitle}> Forget your password</p>
        </div>
        <form className={style.loginForm} onSubmit={this.handleSubmit}>
          <input
            ref={(c) => {
              this.email = c;
            }}
            className={style.loginInput}
            type="email"
            placeholder="email"
            required
          />
          <div>
            <button className={style.loginButton}>
              Send <i className={style.sendIcon} />
            </button>
          </div>
          {this.props.error && (
            <p className={style.errorBox}>{this.props.error}</p>
          )}
          {this.props.success && (
            <p className={style.successBox}>{this.props.success}</p>
          )}
        </form>
      </div>
    );
  }
}

ForgotPassword.propTypes = {
  error: PropTypes.string,
  success: PropTypes.string,
  onResetPassword: PropTypes.func,
};

ForgotPassword.defaultProps = {
  error: null,
  success: null,
  onResetPassword: () => {},
};

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state) => {
    return {
      error: getNetworkError(state, 'user_forget'),
      success: get(state, 'network.success.user_forget.resp.data.message'),
    };
  },
  () => {
    return {
      onResetPassword: (email) => dispatch(forgetPassword(email)),
    };
  }
)(ForgotPassword);
