import React from 'react';
import style from '../Login/style.mcss'

export default React.createClass({

    displayName: 'Register',

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
        if (!this.state.error) {
            console.log('submit!', {email: this.refs.email.value, password: this.state.password});
        }
    },
    
    render() {
        return (<form className={style.loginForm} onSubmit={this.handleSubmit}>
            <label className={style.loginLabel}>
                <input ref="email" type="email" defaultValue="hpccloud@kitware.com"
                    placeholder="email" required/>
            </label>
            <label className={style.loginLabel}>
                <input ref="pass" type="password" value={this.state.password} 
                    onChange={this.passwordChange}
                    placeholder="password" required />
            </label>
            <label className={style.loginLabel}>
                <input ref="pass" type="password" value={this.state.confirm} 
                    onChange={this.confirmChange}
                    placeholder="confirm password" required />
            </label>
            <div>
                <button disabled={!!this.state.error}>Register</button>
            </div>
            {!!this.state.error && (
                <p>{this.state.error}</p>
            )}
        </form>);
    },
});
