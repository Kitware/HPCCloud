import React from 'react';
import PropTypes from 'prop-types';

export default function Switch(props) {
  const cleanProps = Object.assign({}, props);
  delete cleanProps.if;
  delete cleanProps.then;
  delete cleanProps.else;
  delete cleanProps.thenProps;
  delete cleanProps.elseProps;

  if (props.if()) {
    const C = props.then;
    return <C {...cleanProps} {...props.thenProps} />;
  }
  const C = props.else;
  return <C {...cleanProps} {...props.elseProps} />;
}

Switch.propTypes = {
  if: PropTypes.func.isRequired,
  then: PropTypes.func.isRequired,
  else: PropTypes.func.isRequired,

  thenProps: PropTypes.object,
  elseProps: PropTypes.object,
};

Switch.defaultProps = {
  thenProps: {},
  elseProps: {},
};
