import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

export default function LinkIcon(props) {
  return (
    <Link to={props.to} title={props.title}>
      <i className={[props.icon, props.className].join(' ')} />
    </Link>
  );
}

LinkIcon.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  title: PropTypes.string,
};

LinkIcon.defaultProps = {
  className: '',
  title: null,
};
