import React from 'react';
import { Link } from 'react-router';
import client from '../../network';
import style from 'HPCCloudStyle/Theme.mcss';

export default React.createClass({
  displayName: 'HPCCloud-Landing',

  contextTypes: {
    router: React.PropTypes.object,
  },

  componentWillMount() {
    this.subscription = client.onAuthChange((loggedIn) => {
      if (loggedIn) {
        this.context.router.replace('/');
      }
    });
  },

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  },

  /* eslint-disable react/no-danger */
  render() {
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
  },
  /* eslint-enable react/no-danger */
});
