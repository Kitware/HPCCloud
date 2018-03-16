import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import get from 'mout/src/object/get';
import SvgIconWidget from 'paraviewweb/src/React/Widgets/SvgIconWidget';

import theme from 'HPCCloudStyle/Theme.mcss';
import layout from 'HPCCloudStyle/Layout.mcss';
import logo from 'HPCCloudStyle/logo.svg';

import { dispatch } from '../../redux';
import * as NetActions from '../../redux/actions/network';
import * as ProgressActions from '../../redux/actions/progress';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    this.timeout = null;
  }

  componentWillReceiveProps() {
    // a delay for the progressBar to be full and then fade.
    if (this.props.progress === 100) {
      // let the bar's opacity fade: 1.5s delay, 1s duration (see Theme.mcss)
      this.timeout = setTimeout(() => {
        this.props.resetProgress(true);
      }, 2500);
    } else if (this.props.progressReset) {
      // when progressReset, the bar's display is 'none',
      // it takes 2.5s for width & opacity to fade back to initial values to transition .
      this.timeout = setTimeout(() => {
        this.props.resetProgress(false);
      }, 2500);
      // uploading is well done at this point but it is not clear to the user, so unset onbeforeunload here.
      window.onbeforeunload = null;
    } else if (this.props.progress > 0) {
      window.onbeforeunload = () =>
        'There is file uploading in progress. Are you sure you want to leave the page?';
    }
  }

  componentWillUnmount() {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }
  }

  render() {
    const width = `${this.props.progress}%`;
    const opacity = this.props.progress === 100 ? '0' : '1.0';
    const display = this.props.progressReset ? 'none' : null;
    return (
      <div className={layout.verticalFlexContainer}>
        <div className={theme.topBar} style={{ position: 'relative' }}>
          <div
            className={
              this.props.isBusy ? theme.hpcCloudBusyIcon : theme.hpcCloudIcon
            }
          >
            <Link to="/">
              <SvgIconWidget icon={logo} height="1.6em" width="70px" />
            </Link>
          </div>

          <div
            className={theme.progressBar}
            style={{ width, opacity, display }}
          />

          {this.props.userName ? (
            <div className={theme.capitalizeRightText}>
              <Link className={theme.topBarText} to="/Preferences">
                {this.props.userName}
              </Link>
              <Link to="/Logout" className={theme.logout}>
                <i className={theme.logoutIcon} />
              </Link>
            </div>
          ) : (
            <div className={theme.capitalizeRightText}>
              <Link className={theme.topBarText} to="/Register">
                Register
              </Link>{' '}
              |
              <Link className={theme.topBarText} to="/Login">
                Login
              </Link>
            </div>
          )}
        </div>
        <div>{this.props.children}</div>
      </div>
    );
  }
}

TopBar.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  userName: PropTypes.string,
  isBusy: PropTypes.bool,
  progress: PropTypes.number,
  progressReset: PropTypes.bool,
  resetProgress: PropTypes.func,
};

TopBar.defaultProps = {
  userName: null,
  isBusy: false,
  progressReset: false,
  resetProgress: () => {},
  progress: 0,
  children: null,
};

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect((state) => {
  const firstName = get(state, 'auth.user.firstName');
  const lastName = get(state, 'auth.user.lastName');
  const pendingRequests = get(state, 'network.pending') || {};
  const numberOfPendingRequest = Object.keys(pendingRequests).length;
  let progress;
  let progressReset;
  let resetProgress;
  if (state.progress.total === null) {
    progress = Object.keys(state.network.progress).reduce((prev, key) => {
      const file = state.network.progress[key];
      return (
        prev +
        file.current /
          file.total *
          100 /
          Object.keys(state.network.progress).length
      );
    }, 0);
    progressReset = get(state, 'network.progressReset');
    resetProgress = (val) => dispatch(NetActions.resetProgress(val));
  } else {
    progress = state.progress.current / state.progress.total * 100;
    progressReset = state.progress.progressReset;
    resetProgress = (val) => dispatch(ProgressActions.resetProgress(val));
  }
  return {
    userName: firstName ? `${firstName} ${lastName}` : null,
    isBusy: !!numberOfPendingRequest,
    progress: progress || 0,
    progressReset,
    resetProgress,
  };
})(TopBar);
