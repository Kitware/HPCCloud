import React    from 'react';
import { Link } from 'react-router';

export default React.createClass({
  displayName: 'LinkIcon',

  propTypes: {
    className: React.PropTypes.string,
    icon: React.PropTypes.string,
    to: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    return (<Link to={this.props.to}><i className={ [this.props.icon, this.props.className].join(' ') }></i></Link>);
  },
});
