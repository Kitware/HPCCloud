import React        from 'react';
import ButtonBar    from '../../../panels/ButtonBar';

import style        from 'HPCCloudStyle/ItemEditor.mcss';

import getNetworkError from '../../../utils/getNetworkError';
import get from 'mout/src/object/get';
import { connect }  from 'react-redux';
import * as Actions from '../../../redux/actions/user';
import { dispatch } from '../../../redux';

const ChangeInfo = React.createClass({

  displayName: 'User/ChangeInfo',

  propTypes: {
    buttons: React.PropTypes.array,
    className: React.PropTypes.string,
    error: React.PropTypes.string,
    user: React.PropTypes.object,
    onUpdateUser: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      buttons: [{
        name: 'updateUser',
        label: 'Save',
      }],
      error: null,
      success: false,
      user: {},
    };
  },

  changeForm(event) {
    const key = event.target.dataset.key;
    const value = event.target.value;
    this.props.onUpdateUser(Object.assign({}, this.props.user, { [key]: value }));
  },

  handleSubmit(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    this.props.onUpdateUser(this.props.user, true);
  },

  render() {
    return (
      <div className={ this.props.className }>
        <form onSubmit={this.handleSubmit}>
          <section className={style.group}>
            <label className={style.label}>First name</label>
            <input
              className={style.input}
              type="text"
              placeholder="First name"
              onChange={this.changeForm}
              data-key="firstName"
              value={this.props.user.firstName}
              required
            />
          </section>
          <section className={style.group}>
            <label className={style.label}>Last name</label>
            <input
              className={style.input}
              type="text"
              placeholder="Last name"
              onChange={this.changeForm}
              data-key="lastName"
              value={this.props.user.lastName}
              required
            />
          </section>
          <section className={style.group}>
            <label className={style.label}>Email</label>
            <input
              className={style.input}
              type="text"
              placeholder="Email"
              onChange={this.changeForm}
              data-key="email"
              value={this.props.user.email}
              required
            />
          </section>
        </form>
        <ButtonBar
          onAction={ this.handleSubmit }
          error={ this.props.error }
          actions={this.props.buttons}
        />
      </div>);
  },
});

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state) => {
    const error = getNetworkError(state, 'user_update');
    const success = !!get(state, 'network.success.user_update');
    return {
      user: state.auth.user,
      error,
      buttons: [{
        name: 'updateUser',
        label: 'Save',
        icon: success ? style.validIcon : '',
      }],
    };
  },
  () => {
    return {
      onUpdateUser: (user, server) => dispatch(Actions.updateUser(user, server)),
    };
  }
)(ChangeInfo);
