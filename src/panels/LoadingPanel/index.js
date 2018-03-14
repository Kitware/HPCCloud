import React from 'react';
import Theme from 'HPCCloudStyle/Theme.mcss';
import Layout from 'HPCCloudStyle/Layout.mcss';

export default React.createClass({
  displayName: 'LoadingPanel',

  propTypes: {
    center: React.PropTypes.bool,
    large: React.PropTypes.bool,
  },

  getDefaultProps() {
    return { center: false, large: false };
  },

  render() {
    var layoutClasses = [Layout.verticalFlexContainer];

    if (this.props.center) {
      layoutClasses.push(Layout.horizontalCenter);
      layoutClasses.push(Layout.verticalCenter);
    }

    if (this.props.large) {
      layoutClasses.push(Theme.largeText);
    }

    return (
      <div
        className={layoutClasses.join(' ')}
        style={{ marginTop: this.props.large ? '2em' : 'auto' }}
      >
        <span style={{ margin: '15px' }}>
          <i className={Theme.loadingIcon} />&nbsp; Loading...
        </span>
      </div>
    );
  },
});
