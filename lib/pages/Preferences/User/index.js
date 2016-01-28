import React from 'react';
import CollapsibleElement from 'tonic-ui/lib/react/widget/CollapsibleElement';
import superStyle from '../style.mcss';
import formStyle from '../../Login/style.mcss';
import client from '../../../network';

export default React.createClass({

    displayName: 'Preferences/User',

    getInitialState() {
        return {
            error: false,
            success: false,
            oldPassword: '',
            password: '',
            confirm:  '',
        }
    },

    oldPasswordChange(event) {
        var newState = {oldPassword: event.target.value, error: false};
        this.setState(newState);
    },

    passwordChange(event) {
        var newState = {password: event.target.value, error: false};
        this.passwordCheck(event.target.value, this.state.confirm, newState);
        this.setState(newState);
    },

    confirmChange(event) {
        var newState = {confirm: event.target.value};
        this.passwordCheck(this.state.password, event.target.value, newState);
        this.setState(newState);
    },

    passwordCheck(password, confirm, obj) {
        obj.success = false;
        if (password !== confirm) {
            obj.error = 'passwords do not match';
        } else {
            obj.error = false;
        }
    },

    handleSubmit(event) {
        event.preventDefault();
        client.changePassword( this.state.oldPassword,  this.state.password)
            .then(resp => this.setState({error: false, success: true}))
            .catch(err => this.setState({error: err.data.message}));
    },

    render() {
        return <div className={superStyle.preferenceContainer}>
            <CollapsibleElement title="Change Password">
                <form className={superStyle.preferenceForm} onSumbit={this.handleSubmit}>
                    <label className={formStyle.loginLabel}>
                        <input type="password" value={this.state.oldPassword}
                            onChange={this.oldPasswordChange}
                            placeholder="old password" required />
                    </label><label className={formStyle.loginLabel}>
                        <input type="password" value={this.state.password}
                            onChange={this.passwordChange}
                            placeholder="new password" required />
                    </label>
                    <label className={formStyle.loginLabel}>
                        <input type="password" value={this.state.confirm}
                            onChange={this.confirmChange}
                            placeholder="confirm password" required />
                    </label>
                    <div>
                        <button onClick={this.handleSubmit} disabled={!!this.state.error}>Change {
                                this.state.success ? <i className="fa fa-check"></i> : ''}</button>
                    </div>
                    { !!this.state.error && (
                        <p>{this.state.error}</p>
                    )}
                </form>
            </CollapsibleElement>
        </div>;
    },
});
