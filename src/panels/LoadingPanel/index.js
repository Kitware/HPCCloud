import React from 'react';
import PropTypes from 'prop-types';

import Theme from 'HPCCloudStyle/Theme.mcss';
import Layout from 'HPCCloudStyle/Layout.mcss';

export default function LoadingPanel(props) {
  const layoutClasses = [Layout.verticalFlexContainer];

  if (props.center) {
    layoutClasses.push(Layout.horizontalCenter);
    layoutClasses.push(Layout.verticalCenter);
  }

  if (props.large) {
    layoutClasses.push(Theme.largeText);
  }

  return (
    <div
      className={layoutClasses.join(' ')}
      style={{ marginTop: props.large ? '2em' : 'auto' }}
    >
      <span style={{ margin: '15px' }}>
        <i className={Theme.loadingIcon} />&nbsp; Loading...
      </span>
    </div>
  );
}

LoadingPanel.propTypes = {
  center: PropTypes.bool,
  large: PropTypes.bool,
};

LoadingPanel.defaultProps = {
  center: false,
  large: false,
};
