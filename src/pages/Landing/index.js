import React  from 'react';
import client from '../../network';
import style  from 'HPCCloudStyle/Theme.mcss';

const staticContent = require('./content.html');

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
      <div dangerouslySetInnerHTML={{ __html: staticContent.replace('CLASS', style.landingIcon) }}>
      </div>);
  },
  /* eslint-enable react/no-danger */
});
