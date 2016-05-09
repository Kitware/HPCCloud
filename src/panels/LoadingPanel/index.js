import React from 'react';
import Theme  from 'HPCCloudStyle/Theme.mcss';
import Layout from 'HPCCloudStyle/Layout.mcss';

export default React.createClass({
  displayName: 'LoadingPanel',

  render() {
    return (
      <div className={[Layout.verticalFlexContainer].join(' ')}>
        <span style={{ margin: '15px' }}>
          <i className={Theme.loadingIcon}></i>
          Loading...
        </span>
      </div>
    );
  },
});
