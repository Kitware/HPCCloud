import React    from 'react';
import { Link } from 'react-router';
import style    from './LineItem.mcss';

const status2icon = {
    preprocessing: 'fa fa-fw fa-pencil',
    processing: 'fa fa-fw fa-rocket',
    postprocessing: 'fa fa-fw fa-database',
}

export default React.createClass({

    displayName: 'Simulation/Item/Line',

    propTypes: {
        item: React.PropTypes.object,
        location: React.PropTypes.object,
    },

    render() {
        const filter = (this.props.location.query.filter || '').toLowerCase();
        if(this.props.item.name.toLowerCase().indexOf(filter) !== -1) {
            return (
                <div className={ style.container }>
                    <div className={ style.status }>
                        <i className={ status2icon[this.props.item.status] || 'fa fa-fw fa-question' }></i>
                    </div>
                    <div className={ style.name }>
                        <Link to={ '/View/Simulation/' + this.props.item._id }>
                            { this.props.item.name }
                        </Link>
                    </div>
                    <div className={ style.action }>
                        <Link to={ '/Edit/Simulation/' + this.props.item._id }>
                            <i className='fa fa-fw fa-cog'></i>
                        </Link>
                    </div>
                </div>);
        }
        return null;
    },
});
