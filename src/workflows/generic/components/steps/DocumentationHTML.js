import React from 'react';
import PropTypes from 'prop-types';

/* eslint-disable react/no-danger */
export default function renderHTML(props) {
  return <div dangerouslySetInnerHTML={{ __html: props.staticContent }} />;
}
/* eslint-enable react/no-danger */

renderHTML.propTypes = {
  staticContent: PropTypes.string,
};

renderHTML.defaultProps = {
  staticContent: '',
};
