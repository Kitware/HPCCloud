import React from 'react';
import style from './LineListItems.mcss';

import merge from 'mout/src/object/merge';

export default React.createClass({

    displayName: 'LineListing',

    propTypes: {
        itemRenderer: React.PropTypes.func,
        list: React.PropTypes.array,
    },

    getDefaultProps() {
        return {
            list: [],
        };
    },

    render() {
        return (
            <div className={ style.container }>
                { this.props.list.map( (item, idx) => {
                    return (
                        <div key={ item._id } className={ (idx % 2 === 0) ? style.even : style.odd }>
                            { React.createElement(this.props.itemRenderer, merge({item}, this.props)) }
                        </div>);
                })}
            </div>);
    },
});
