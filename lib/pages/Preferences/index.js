import React    from 'react';

export const breadcrumb = {
    paths: [
        '/Preferences/User',
        '/Preferences/Cluster',
        '/Preferences/AWS',
    ],
    icons: [
        'fa fa-fw fa-user',
        'fa fa-fw fa-desktop',
        'fa fa-fw fa-mixcloud',
    ],
};

export default React.createClass({

    displayName: 'Preferences',

    propTypes: {
        children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
    },

    render() {
        return <div>{ this.props.children }</div>;
    },
});
