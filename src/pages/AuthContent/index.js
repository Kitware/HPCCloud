import React from 'react';
import PropTypes from 'prop-types';

export default function HPCCloudAuthContent(props) {
  return <div className="HPCCloud__content">{props.children}</div>;
}

HPCCloudAuthContent.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

HPCCloudAuthContent.defaultProps = {
  children: null,
};
