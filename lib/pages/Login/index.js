import React  from 'react';
import { Link } from 'react-router';
import client from '../../network';
import style  from './style.mcss';

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

    componentWillMount() {
        this.subscription = client.onAuthChange((loggedIn) => {
            // FIXME handle state...
            if(loggedIn) {
                this.context.router.replace('/');
            }
        });
    },

    componentWillUnmount() {
        if(this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    },

    handleSubmit(event) {
        event.preventDefault();
        client.login(this.refs.login.value, this.refs.pass.value)
            .then(resp => {
                const { location } = this.props;

                if (location.state && location.state.nextPathname) {
                    this.context.router.replace(location.state.nextPathname);
                } else {
                    this.context.router.replace('/');
                }
            })
            .catch(err => {
                this.setState({ error: true, message: err.data.message });
            });
    },

    render() {
        return (
        <div className={style.center}>
            <div className={style.header}>
                <i className='fa fa-cloud-download' style={{fontSize: '150px'}}></i>
                <p className={style.subtitle}> Login to HPC Cloud</p>
            </div>
            <form className={style.loginForm} onSubmit={this.handleSubmit}>
                <input ref="login" className={style.loginInput} type="login" placeholder="login" required/>
                <input ref="pass" className={style.loginInput} type="password" placeholder="password" required/>
                <div>
                    <button className={style.loginButton}>Login <i className="fa fa-arrow-circle-o-right"></i></button>
                    <div className={style.forgotPassword}>
                        <Link to={'/forgot'}>Forget password?</Link>
                    </div>
                </div>
                {this.state.error && (
                    <p className={style.errorBox}>Bad login information</p>
                )}
            </form>
        </div>);
    },
});
