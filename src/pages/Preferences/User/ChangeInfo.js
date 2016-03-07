import React        from 'react';
import ButtonBar    from '../../../panels/ButtonBar';
import client       from '../../../network';

import style        from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({

  displayName: 'User/ChangeInfo',

  propTypes: {
    buttons: React.PropTypes.array,
    className: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      buttons: [{
        name: 'updateUser',
        label: 'Save',
      }],
    };
  },

  getInitialState() {
    return {
      error: '',
      success: false,
      oldPassword: '',
      password: '',
      confirm: '',
      user: {},
      buttons: this.props.buttons,
    };
  },

  componentWillMount() {
    this.updateState();
  },

  updateState() {
    this.setState({ user: client.getUser() });
  },

  changeForm(event) {
    var key = event.target.dataset.key,
      user = this.state.user;
    user[key] = event.target.value;
    this.setState({ user });
  },

  handleSubmit(event) {
    event.preventDefault();
    this.updateUser();
  },

  updateUser() {
    const buttons = this.state.buttons,
      newInfo = {
        firstName: this.state.user.firstName,
        lastName: this.state.user.lastName,
        email: this.state.user.email,
        _id: this.state.user._id,
      };
    client.updateUser(newInfo)
      .then(resp => {
        buttons[0].icon = style.validIcon;
        this.setState({ buttons, error: '', success: true });
      })
      .catch(err => {
        buttons[0].icon = '';
        this.setState({ buttons, error: err.data.message });
      });
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
              value={this.state.user.firstName}
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
              value={this.state.user.lastName}
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
              value={this.state.user.email}
              required
            />
          </section>
        </form>
        <ButtonBar
          onAction={ this.updateUser }
          error={ this.state.error }
          actions={this.state.buttons}
        />
      </div>);
  },
});
