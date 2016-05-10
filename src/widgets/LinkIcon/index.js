import React    from 'react';
import { Link } from 'react-router';

export default React.createClass({
  displayName: 'LinkIcon',

  propTypes: {
    className: React.PropTypes.string,
    icon: React.PropTypes.string,
    to: React.PropTypes.string,
    title: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      className: '',
      title: null,
    };
  },

  render() {
    return (<Link to={this.props.to} title={this.props.title}>
      <i className={ [this.props.icon, this.props.className].join(' ') }></i>
    </Link>);
  },
});
