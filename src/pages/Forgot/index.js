import React    from 'react';
import client   from '../../network';

import style    from 'HPCCloudStyle/Login.mcss';
import layout   from 'HPCCloudStyle/Layout.mcss';

export default React.createClass({

  displayName: 'ForgotPassword',

  propTypes: {
    location: React.PropTypes.object,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  getInitialState() {
    return {
      error: null,
      success: null,
    };
  },

  handleSubmit(event) {
    event.preventDefault();
    const email = this.refs.email.value;
    client.resetPassword(email)
      .then(resp => {
        this.setState({
          error: null,
          success: resp.data.message,
        });
      })
      .catch(err => {
        this.setState({
          error: err.data.message,
          success: null,
        });
      });
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
              {this.state.error && (
                  <p className={style.errorBox}>{this.state.error}</p>
              )}
              {this.state.success && (
                  <p className={style.successBox}>{this.state.success}</p>
              )}
          </form>
      </div>);
  },
});
