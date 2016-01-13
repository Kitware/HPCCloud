import React from 'react';
import auth  from '../../config/auth.js'

export default React.createClass({

    displayName: 'Logout',

    componentDidMount() {
        auth.logout()
    },

    render() {
        return <div>Logout content</div>;
    },
});
