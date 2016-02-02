import React    from 'react';
import { Link } from 'react-router';
import style    from 'hpccloud/style/LineItem.mcss';

const status2icon = {
    preprocessing: 'fa fa-fw fa-pencil',
    processing: 'fa fa-fw fa-rocket',
    postprocessing: 'fa fa-fw fa-database',
}

export default React.createClass({

    displayName: 'Simulation/Item/Line',

    propTypes: {
        item: React.PropTypes.object,
    },

    render() {
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
                <div className={ style.description }>
                    <Link to={ '/View/Simulation/' + this.props.item._id }>
                        { this.props.item.description }
                    </Link>
                </div>
                <div className={ style.time }>
                    <Link to={ '/View/Simulation/' + this.props.item._id }>
                        { this.props.item.created }
                    </Link>
                </div>
                <div className={ style.time }>
                    <Link to={ '/View/Simulation/' + this.props.item._id }>
                        { this.props.item.updated }
                    </Link>
                </div>
                <div className={ style.action }>
                    <Link to={ '/Edit/Simulation/' + this.props.item._id }>
                        <i className='fa fa-fw fa-cog'></i>
                    </Link>
                </div>
            </div>);
    },
});
