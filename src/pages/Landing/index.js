import React from 'react';
import PropTypes from 'prop-types';

import { Link, withRouter } from 'react-router-dom';

import style from 'HPCCloudStyle/Theme.mcss';

import client from '../../network';

export class LandingPage extends React.Component {
  componentWillMount() {
    this.subscription = client.onAuthChange((loggedIn) => {
      if (loggedIn) {
        this.props.history.push('/');
      }
    });
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  /* eslint-disable react/no-danger */
  render() {
    console.log('render landing');
    return (
      <main style={{ margin: 'auto', textAlign: 'center' }}>
        <br />
        <br />
        <i className={style.landingIcon} style={{ fontSize: '250px' }} />
        <h2>Welcome to HPCCloud</h2>
        <p>
          Get started by <Link to="/Register">registering</Link> or{' '}
          <Link to="/Login">logging in</Link>
        </p>
      </main>
    );
  }
  /* eslint-enable react/no-danger */
}

LandingPage.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(LandingPage);
