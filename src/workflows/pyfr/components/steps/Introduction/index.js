import React from 'react';

const staticContent = require('./content.html');

export default React.createClass({

  displayName: 'StaticContent',

  /* eslint-disable react/no-danger */
  render() {
    return <div dangerouslySetInnerHTML={{ __html: staticContent }}></div>;
  },
  /* eslint-enable react/no-danger */
});
