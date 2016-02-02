import React            from 'react';
import style            from 'hpccloud/style/LineListItems.mcss';
import { itemFilter }   from '../../utils/Filters'

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
        var filteredList = this.props.list.filter(itemFilter);
        return (
            <div className={ style.container }>
                { filteredList.map( (item, idx) => {
                    return (
                        <div key={ item._id } className={ (idx % 2 === 0) ? style.even : style.odd }>
                            { React.createElement(this.props.itemRenderer, {item}) }
                        </div>);
                })}
            </div>);
    },
});
