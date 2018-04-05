import React from 'react';
import PropTypes from 'prop-types';

export default function ImageIcon(props) {
  if (props.data && props.data.image) {
    return (
      <img
        alt={props.data.alt || 'ImageIcon'}
        src={props.data.image}
        style={{ height: props.height }}
      />
    );
  }

  if (props.data && props.data.icon) {
    return <i className={props.data.icon} />;
  }

  return null;
}

ImageIcon.propTypes = {
  data: PropTypes.object.isRequired,
  height: PropTypes.string,
};

ImageIcon.defaultProps = {
  height: '1.5em',
};
