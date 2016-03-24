import React    from 'react';
import { Link } from 'react-router';
import SvgIconWidget from 'paraviewweb/src/React/Widgets/SvgIconWidget';

import theme    from 'HPCCloudStyle/Theme.mcss';
import layout   from 'HPCCloudStyle/Layout.mcss';
import logo     from 'HPCCloudStyle/logo.svg';

import get                from 'mout/src/object/get';
import { connect }        from 'react-redux';

const TopBar = React.createClass({

  displayName: 'HPCCloud-TopBar',

  propTypes: {
    children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
    location: React.PropTypes.object,
    userName: React.PropTypes.string,
    isBusy: React.PropTypes.bool,
    progress: React.PropTypes.number,
  },

  getDefaultProps() {
    return {
      userName: null,
      isBusy: false,
      progress: 0,
    };
  },

  render() {
    return (
      <div className={ layout.verticalFlexContainer }>
        <div className={ theme.topBar } style={{ position: 'relative' }}>
            <div className={(this.props.isBusy ? theme.hpcCloudBusyIcon : theme.hpcCloudIcon)}>
                <Link to="/">
                  <SvgIconWidget icon={logo} height="1.35em" width="70px" />
                </Link>
            </div>

            <div className={ theme.progressBar }
              style={{
                width: `${this.props.progress}%`,
                opacity: (this.props.progress === 100 ? '0' : '1.0'),
              }}
            >
            </div>

            { this.props.userName ? (
                <div className={ theme.capitalizeRightText }>
                    <Link className={ theme.topBarText } to="/Preferences">{ this.props.userName }</Link>
                    <Link to="/Logout" className={ theme.logout }><i className={ theme.logoutIcon }></i></Link>
                </div>
            ) : (
                <div className={ theme.capitalizeRightText }>
                    <Link className={ theme.topBarText } to="/Register">Register</Link> |
                    <Link className={ theme.topBarText } to="/Login">Login</Link>
                </div>
            )}
        </div>
        <div>
            { this.props.children }
        </div>
      </div>);
  },
});

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  state => {
    const firstName = get(state, 'auth.user.firstName');
    const lastName = get(state, 'auth.user.lastName');
    const pendingRequests = get(state, 'network.pending') || {};
    const numberOfPendingRequest = Object.keys(pendingRequests).length;
    const progress = numberOfPendingRequest
      ? (100 * Object.keys(pendingRequests).map(item => item.progress).reduce((a, b) => a + b) / numberOfPendingRequest)
      : 0;
    return {
      userName: firstName ? `${firstName} ${lastName}` : null,
      isBusy: !!numberOfPendingRequest,
      progress,
    };
  }
)(TopBar);
