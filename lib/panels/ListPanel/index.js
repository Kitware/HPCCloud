import React    from 'react';
import { Link } from 'react-router';
import style    from './list-resource.mcss';

export default React.createClass({

    displayName: 'ListResources',

    propTypes: {
        add: React.PropTypes.string,
        itemRenderer: React.PropTypes.func,
        list: React.PropTypes.array,
        listComponent: React.PropTypes.func,
        title: React.PropTypes.string,
    },

    getDefaultProps() {
        return {
            add: '/',
            list: [],
            title: 'No title given',
        };
    },

    render() {
        return (
            <div className={ style.container }>
                <div className={ style.actionBar }>
                    <div className={ style.actionBarLeft }>
                        <Link to={this.props.add}><i className='fa fa-plus'></i></Link>
                    </div>
                    <div className={ style.actionBarCenter }>
                        { this.props.title }
                    </div>
                    <div className={ style.actionBarRight }>
                    </div>
                </div>
                <div className={ style.content }>
                    { React.createElement(this.props.listComponent, this.props) }
                </div>
            </div>);
    },
});
