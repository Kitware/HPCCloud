import React    from 'react';
import { Link } from 'react-router';

export default React.createClass({
    displayName: 'LinkIcon',

    propTypes: {
        icon: React.PropTypes.string,
        to: React.PropTypes.string,
    },

    render() {
        return (<Link to={this.props.to}><i className={this.props.icon}></i></Link>);
    },
})
