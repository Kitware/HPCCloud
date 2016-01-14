import React    from 'react';
import { Link } from 'react-router';

export default React.createClass({

    displayName: 'Project/All/Item',

    propTypes: {
        item: React.PropTypes.object,
        location: React.PropTypes.object,
    },

    render() {
        const filter = (this.props.location.query.filter || '').toLowerCase();
        if(this.props.item.name.toLowerCase().indexOf(filter) !== -1) {
            return <Link to={ '/View/Project/' + this.props.item.id }>{ this.props.item.name }</Link>;
        }
        return null;
    },
});
