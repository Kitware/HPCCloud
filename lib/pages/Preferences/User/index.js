import React from 'react';
import CollapsibleElement from 'tonic-ui/lib/react/widget/CollapsibleElement';
import superStyle from '../style.mcss';
import formStyle from '../../Login/style.mcss';

export default React.createClass({

    displayName: 'Preferences/User',

    getInitialState() {
        return {
            error: false,
            password: '',
            confirm:  '',
        }
    },
    
    passwordChange(e) {
        var newState = {password: e.target.value};
        this.passwordCheck(e.target.value, this.state.confirm, newState);
        this.setState(newState);
    },
    
    confirmChange(e) {
        var newState = {confirm: e.target.value};
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
        console.log('submit!');
    },

    render() {
        return <div className={superStyle.preferenceContainer}>
            <CollapsibleElement title="Change Password">
                <form className={superStyle.preferenceForm} onSumbit={this.handleSubmit}>
                    <label className={formStyle.loginLabel}>
                        <input ref="pass" type="password" value={this.state.password} 
                            onChange={this.passwordChange}
                            placeholder="password" required />
                    </label>
                    <label className={formStyle.loginLabel}>
                        <input ref="pass" type="password" value={this.state.confirm} 
                            onChange={this.confirmChange}
                            placeholder="confirm password" required />
                    </label>
                    <div>
                        <button disabled={!!this.state.error}>Change</button>
                    </div>
                    { !!this.state.error && (
                        <p>{this.state.error}</p>
                    )}
                </form>
            </CollapsibleElement>
        </div>;
    },
});
