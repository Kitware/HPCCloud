import React from 'react';
import style from 'HPCCloudStyle/Layout.mcss';

const classes = [
  style.verticalFlexContainer,
  style.fullWidth,
  style.halfHeight,
  style.horizontalCenter,
  style.verticalCenter,
  style.textCenter,
].join(' ');

export default React.createClass({
  displayName: 'EmptyPlaceholder',

  propTypes: {
    phrase: React.PropTypes.string,
  },

  render() {
    return (
      <div className={ classes }>
        {this.props.phrase}
      </div>);
  },
});
