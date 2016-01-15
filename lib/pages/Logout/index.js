import React  from 'react';
import client from '../../network';

export default React.createClass({

    displayName: 'Logout',

    contextTypes: {
        router: React.PropTypes.object,
    },

    componentDidMount() {
        client.logout()
        this.context.router.replace('/');
    },

    render() {
        return null;
    },
});
