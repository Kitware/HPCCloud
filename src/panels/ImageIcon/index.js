import React from 'react';

export default React.createClass({
  displayName: 'ImageIcon',

  propTypes: {
    data: React.PropTypes.object,
    height: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      height: '1.5em',
    };
  },

  render() {
    if (this.props.data && this.props.data.image) {
      return (
        <img
          src={this.props.data.image}
          style={{ height: this.props.height }}
        />
      );
    }

    if (this.props.data && this.props.data.icon) {
      return <i className={this.props.data.icon} />;
    }

    return null;
  },
});
