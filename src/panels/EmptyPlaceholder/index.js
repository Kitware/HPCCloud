import React from 'react';
import style from 'HPCCloudStyle/Layout.mcss';

// used for empty placeholders on some pages

const classes = [
  style.verticalFlexContainer,
  style.fullWidth,
  style.halfHeight,
  style.horizontalCenter,
  style.verticalCenter,
  style.textCenter,
].join(' ');

const placeholder = (props) => (
  <div className={ classes }>
    { props.phrase }
  </div>
);

placeholder.displayName = 'EmptyPlaceholder';
placeholder.propTypes = { phrase: React.PropTypes.oneOfType([
  React.PropTypes.string,
  React.PropTypes.object,
]) };

export default placeholder;
