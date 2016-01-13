import React    from 'react';
import { Link } from 'react-router';
import auth     from '../../config/auth.js';
import style    from './main-layout.mcss';

export default React.createClass({

    displayName: 'HPCCloud-TopBar',

    propTypes: {
        children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
        location: React.PropTypes.object,
    },

    getInitialState() {
        return {
            loggedIn: auth.loggedIn(),
        }
    },

    componentWillMount() {
        auth.onChange = this.updateAuth;
        auth.login();
    },

    updateAuth(loggedIn) {
        this.setState({
            loggedIn: !!loggedIn,
        })
    },

    render() {
        return (<div className={ style.container }>
                    <div className={ style.topBar }>
                        <div className={ style.topBarItem }>
                            <Link to='/'><i className='fa fa-cloud'></i>HPC</Link>
                        </div>
                        { this.state.loggedIn ? (
                            <div className={ style.topBarRightItem }>
                                <Link to='/Preferences'>{ auth.getUserName() }</Link> | <Link to='/Logout'>Logout</Link>
                            </div>
                        ) : (
                            <div className={ style.topBarRightItem }>
                                <Link to='/Register'>Register</Link> | <Link to='/Login'>Login</Link>
                            </div>
                        )}
                    </div>
                    <div className={ style.content }>
                        { this.props.children }
                    </div>
                </div>);
    },
});
