import React    from 'react';
import { Link } from 'react-router';
import client   from '../../network';
import style    from 'HPCCloudStyle/hpccloud.mcss';
import theme    from 'HPCCloudStyle/theme.mcss';
import layout    from 'HPCCloudStyle/layout.css';

export default React.createClass({

    displayName: 'HPCCloud-TopBar',

    propTypes: {
        children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
        location: React.PropTypes.object,
    },

    getInitialState() {
        return {
            loggedIn: client.loggedIn(),
            isBusy: false,
        }
    },

    componentWillMount() {
        this.subscription = client.onAuthChange(this.updateAuth);
        this.busySubscription = client.onBusy(this.updateBusy);
    },

    componentWillUnmount() {
        if(this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }

        if(this.busySubscription) {
            this.busySubscription.unsubscribe();
            this.busySubscription = null;
        }
    },

    updateAuth(loggedIn) {
        this.setState({
            loggedIn: !!loggedIn,
        })
    },

    updateBusy(isBusy) {
        this.setState({isBusy});
    },

    render() {
        return (<div className={ layout.verticalFlexContainer }>
                    <div className={ theme.topBar }>
                        <div className={ style[ this.state.isBusy ? 'topBarItemBusy ' : ''] + layout.flexItem }>
                            <Link to='/'><i className='fa fa-cloud'></i> HPC</Link>
                        </div>
                        { this.state.loggedIn ? (
                            <div className={ style.topBarRightItem }>
                                <Link to='/Preferences'>{ client.getUserName() }</Link> | <Link to='/Logout'>Logout</Link>
                            </div>
                        ) : (
                            <div className={ style.topBarRightItem }>
                                <Link to='/Register'>Register</Link> | <Link to='/Login'>Login</Link>
                            </div>
                        )}
                    </div>
                    <div className={ layout.flexItem }>
                        { this.props.children }
                    </div>
                </div>);
    },
});
