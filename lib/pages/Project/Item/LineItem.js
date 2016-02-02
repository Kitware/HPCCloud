import React     from 'react';
import style     from 'hpccloud/style/LineItem.mcss';
import Workflows from '../../../types';
import { Link }  from 'react-router';

export default React.createClass({

    displayName: 'Project/All/Item',

    propTypes: {
        item: React.PropTypes.object,
    },

    render() {
        return <div className={ style.container }>
            <Link to={ '/View/Project/' + this.props.item._id }>
                <img height='20' src={Workflows[this.props.item.type].logo} alt={this.props.item.type} title={this.props.item.type}/>
                <i className='fa fa-fw'></i>
                { this.props.item.name }
                <i className='fa fa-fw'></i>
                { this.props.item.description }
                <i className='fa fa-fw'></i>
                {new Date(Date.parse(this.props.item.created)).toLocaleFormat()}
                <i className='fa fa-fw'></i>
                {new Date(Date.parse(this.props.item.updated)).toLocaleFormat()}
            </Link>
            </div>;
    },
});
