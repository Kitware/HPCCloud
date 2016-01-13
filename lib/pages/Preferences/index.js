import React    from 'react';
import { Link } from 'react-router';

const prefList = (<div>
        <Link to='/Preferences/User'>User</Link>
        <Link to='/Preferences/AWS'>AWS</Link>
        <Link to='/Preferences/Cluster'>Cluster</Link>
        <Link to='/Preferences/OpenStack'>OpenStack</Link>
    </div>);

export default React.createClass({

    displayName: 'Preferences',

    propTypes: {
        children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
    },

    render() {
        const children = this.props.children || prefList;
        return <div>
                    <Link to='/Preferences'>Preferences selection</Link>
                    { children }
                </div>;
    },
});
