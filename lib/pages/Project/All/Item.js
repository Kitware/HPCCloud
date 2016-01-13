import React    from 'react';
import { Link } from 'react-router';

export default React.createClass({

    displayName: 'Project/All/Item',

    propTypes: {
        item: React.PropTypes.object,
    },

    render() {
        return <Link to={ '/View/Project/' + this.props.item.id }>{ this.props.item.name }</Link>;
    },
});
