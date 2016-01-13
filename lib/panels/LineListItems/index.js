import React from 'react';
import style from './line-list-items.mcss';

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
                { this.props.list.map( item => {
                    return (
                        <div className={ style.line }>
                            { React.createElement(this.props.itemRenderer, { item }) }
                        </div>);
                })}
            </div>);
    },
});
