import React            from 'react';
import { Link }         from 'react-router';
import { updateQuery }  from '../../utils/Filters'
import style            from 'HPCCloudStyle/ListPanel.mcss';
import layout   from 'HPCCloudStyle/layout.css';
import theme   from 'HPCCloudStyle/theme.mcss';

import merge from 'mout/src/object/merge';

export default React.createClass({

    displayName: 'ListResources',

    propTypes: {
        add: React.PropTypes.string,
        edit: React.PropTypes.string,
        itemRenderer: React.PropTypes.func,
        list: React.PropTypes.array,
        listComponent: React.PropTypes.func,
        location: React.PropTypes.object,
        title: React.PropTypes.string,
    },

    contextTypes: {
        router: React.PropTypes.object,
    },

    getDefaultProps() {
        return {
            add: '/',
            edit: null,
            list: [],
            title: 'No title given',
        };
    },

    updateFilter(e) {
        const filter = e.target.value;

        this.context.router.replace({
            pathname: this.props.location.pathname,
            query: merge(this.props.location.query, {filter}),
            state: this.props.location.state,
        });
    },

    render() {
        updateQuery(this.props.location.query.filter);
        return (
            <div className={ layout.verticalFlexContainer }>
                <div className={ theme.subBar }>
                    <div className={ style.actionBarLeft }>
                        <Link to={this.props.add}><i className='fa fa-plus'></i></Link>
                        { this.props.edit ? <Link to={this.props.edit}><i className='fa fa-pencil'></i></Link> : null }
                    </div>
                    <div className={ style.actionBarCenter }>
                        { this.props.title }
                    </div>
                    <div className={ style.actionBarRight }>
                        <input type='text' className={ style.filter }
                            placeholder="filter by name"
                            value={ this.props.location.query.filter || '' }
                            onChange={ this.updateFilter }/>
                    </div>
                </div>
                <div className={ style.content }>
                    { React.createElement(this.props.listComponent, this.props) }
                </div>
            </div>);
    },
});
