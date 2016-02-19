import React    from 'react';
import { Link } from 'react-router';
import client   from '../../network';

import state    from 'HPCCloudStyle/States.mcss';
import theme    from 'HPCCloudStyle/Theme.mcss';
import layout   from 'HPCCloudStyle/Layout.mcss';

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
            progress: 0,
        }
    },

    componentWillMount() {
        this.subscription = client.onAuthChange(this.updateAuth);
        this.busySubscription = client.onBusy(this.updateBusy);
        this.progressSubscription = client.onProgress(this.updateProgress);
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

    updateProgress({current, total}) {
        const progress = Math.floor(current/total * 100);
        this.setState({progress});
        if (progress === 100) {
            setTimeout(() => {
                this.setState({progress: 0});
            }, 2000)
        }
    },

    render() {
        return (<div className={ layout.verticalFlexContainer }>
                    <div className={ theme.topBar } style={{position:'relative'}}>
                        <div className={ this.state.isBusy ? state.isBusy : '' }>
                            <Link to='/'><i className={ theme.hpcCloudIcon }></i> HPC</Link>
                        </div>

                        <div className={ theme.progressBar }
                            style={{
                                width: this.state.progress + '%',
                                opacity: (this.state.progress === 100 ? '0' : '1.0'),
                            }}>
                        </div>

                        { this.state.loggedIn ? (
                            <div className={ theme.capitalizeRightText }>
                                <Link className={ theme.topBarText } to='/Preferences'>{ client.getUserName() }</Link>
                                <Link to='/Logout' className={ theme.logout }><i className={ theme.logoutIcon }></i></Link>
                            </div>
                        ) : (
                            <div className={ theme.capitalizeRightText }>
                                <Link className={ theme.topBarText } to='/Register'>Register</Link> |
                                <Link className={ theme.topBarText } to='/Login'>Login</Link>
                            </div>
                        )}
                    </div>
                    <div>
                        { this.props.children }
                    </div>
                </div>);
    },
});
