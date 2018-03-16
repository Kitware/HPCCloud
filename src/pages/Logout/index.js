import React from 'react';
import PropTypes from 'prop-types';

import client from '../../network';

export default class Logout extends React.Component {
  componentDidMount() {
    client
      .logout()
      .then(() => this.props.history.push('/'))
      .catch(() => this.props.history.push('/'));
  }

  render() {
    return null;
  }
}

Logout.propTypes = {
  history: PropTypes.object.isRequired,
};
