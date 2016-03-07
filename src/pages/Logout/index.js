import React  from 'react';
import client from '../../network';

export default React.createClass({

  displayName: 'Logout',

  contextTypes: {
    router: React.PropTypes.object,
  },

  componentDidMount() {
    client.logout()
      .then(_ => this.context.router.replace('/'))
      .catch(_ => this.context.router.replace('/'));
  },

  render() {
    return null;
  },
});
