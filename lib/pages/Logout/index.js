import React from 'react';
import auth  from '../../config/auth.js'

export default React.createClass({

    displayName: 'Logout',

    contextTypes: {
        router: React.PropTypes.object,
    },

    componentDidMount() {
        auth.logout()
        this.context.router.replace('/');
    },

    render() {
        return null;
    },
});
