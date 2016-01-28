import React  from 'react';
import style  from '../Login/style.mcss'
import client from '../../network';

export default React.createClass({

    displayName: 'Register',

    contextTypes: {
        router: React.PropTypes.object,
    },

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

    resetError() {
        if(this.state.error) {
            this.setState({error: false});
        }
    },

    handleSubmit(event) {
        event.preventDefault();
        if (!this.state.error) {
            const user = {};
            ['login', 'firstName', 'lastName', 'email', 'password'].forEach( key => {
                user[key] = this.refs[key].value;
            });
            client.registerUser(user)
                .then(resp => {
                    this.context.router.replace('/Login');
                })
                .catch(resp => {
                    this.setState({error: resp.data.message});
                });
        }
    },

    render() {
        return (
            <center>
                <form className={style.loginForm} onSubmit={this.handleSubmit}>
                    <input className={style.loginInput} ref="firstName" type="text" placeholder="firstName" required/>
                    <input className={style.loginInput} ref="lastName" type="text" placeholder="lastName" required/>
                    <input className={style.loginInput} ref="login" type="text" placeholder="login" onChange={this.resetError} required/>
                    <input className={style.loginInput} ref="email" type="email" placeholder="email" onChange={this.resetError} required/>
                    <input className={style.loginInput} ref="password" type="password" value={this.state.password}
                        onChange={this.passwordChange}
                        placeholder="password" required />
                    <input className={style.loginInput} ref="confirm" type="password" value={this.state.confirm}
                        onChange={this.confirmChange}
                        placeholder="confirm password" required />
                    <div>
                        <button className={style.loginButton} disabled={!!this.state.error}>Register</button>
                    </div>
                    {!!this.state.error && (
                        <p className={style.warningBox}>{this.state.error}</p>
                    )}
                </form>
            </center>);
    },
});
