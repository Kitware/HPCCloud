import React from 'react';

/* eslint-disable react/no-danger */
export default function renderHTML(props) {
  return <div dangerouslySetInnerHTML={{ __html: props.staticContent }}></div>;
}
/* eslint-enable react/no-danger */

renderHTML.propTypes = {
  staticContent: React.PropTypes.string,
};

renderHTML.defaultProps = {
  staticContent: '',
};
