import React        from 'react';
import ButtonBar    from '../../../panels/ButtonBar';
import client       from '../../../network';

import style        from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({
    displayName: 'User/ChangePassword',

    propTypes: {
        buttons: React.PropTypes.array,
        className: React.PropTypes.string,
    },

    getDefaultProps() {
        return {
            buttons: [{name:'changePass', label:'Change password'}],
        };
    },

    getInitialState() {
        return {
            error: '',
            success: false,
            oldPassword: '',
            password: '',
            confirm:  '',
            buttons: this.props.buttons,
        }
    },

    oldPasswordChange(event) {
        var newState = {oldPassword: event.target.value, error: ''};
        this.setState(newState);
    },

    passwordChange(event) {
        var newState = {password: event.target.value, error: ''};
        this.passwordCheck(event.target.value, this.state.confirm, newState);
        this.setState(newState);
    },

    confirmChange(event) {
        var newState = {confirm: event.target.value};
        this.passwordCheck(this.state.password, event.target.value, newState);
        this.setState(newState);
    },

    passwordCheck(password, confirm, obj) {
        if (password !== confirm) {
            obj.error = 'passwords do not match';
        } else {
            obj.error = '';
        }
    },

    handleSubmit(event) {
        event.preventDefault();
        this.changePassword();
    },

    changePassword() {
        const buttons = this.state.buttons;
        client.changePassword( this.state.oldPassword,  this.state.password)
            .then(resp => {
                buttons[0].icon = 'fa fa-check';
                this.setState({ buttons, error: '', success: true});
            })
            .catch(err => {
                buttons[0].icon = '';
                this.setState({ buttons, error: err.data.message});
            });
    },

    render() {
        return (
            <div className={ this.props.className }>
                <form onSumbit={this.handleSubmit}>
                    <section className={style.group}>
                        <label className={style.label}>Password</label>
                        <input className={style.input} type="password" value={this.state.oldPassword}
                            onChange={this.oldPasswordChange}
                            placeholder="old password" required />
                    </section>
                    <section className={style.group}>
                        <label className={style.label}>New password</label>
                        <input className={style.input} type="password" value={this.state.password}
                            onChange={this.passwordChange}
                            placeholder="new password" required />
                    </section>
                    <section className={style.group}>
                        <label className={style.label}>Confirm password</label>
                        <input className={style.input} type="password" value={this.state.confirm}
                            onChange={this.confirmChange}
                            placeholder="confirm password" required />
                    </section>
                </form>
                <ButtonBar onAction={ this.changePassword }
                    error={ this.state.error }
                    actions={this.state.buttons}
                    />
            </div>
        );
    },
});
