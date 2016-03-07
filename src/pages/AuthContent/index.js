import React from 'react';

export default React.createClass({

  displayName: 'HPCCloud-auth-content',

  propTypes: {
    children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
  },

  render() {
    return (<div className="HPCCloud__content">{ this.props.children }</div>);
  },
});
