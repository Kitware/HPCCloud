import React from 'react';
import auth  from '../../config/auth.js';
import style from './style.mcss';

export default React.createClass({

    displayName: 'Login',

    propTypes: {
        location: React.PropTypes.object,
    },

    contextTypes: {
        router: React.PropTypes.object,
    },

    getInitialState() {
        return {
            error: false,
        }
    },

    handleSubmit(event) {
        event.preventDefault();

        const email = this.refs.email.value;
        const pass = this.refs.pass.value;

        auth.login(email, pass, (loggedIn) => {
            if (!loggedIn) {
                return this.setState({ error: true });
            }
            const { location } = this.props;

            if (location.state && location.state.nextPathname) {
                this.context.router.replace(location.state.nextPathname);
            } else {
                this.context.router.replace('/');
            }
        })
    },

    render() {
        return (
        <div className={style.center}>
            <form className={style.loginForm} onSubmit={this.handleSubmit}>
                <label className={style.loginLabel}><input ref="email" type="email" placeholder="email" defaultValue="hpccloud@kitware.com" required/></label>
                <label className={style.loginLabel}><input ref="pass" type="password" placeholder="(hint: aa)" required/></label>
                <div>
                    <button>login <i className="fa fa-arrow-circle-o-right"></i></button>
                </div>
                {this.state.error && (
                    <p>Bad login information</p>
                )}
            </form>
        </div>);
    },
});
