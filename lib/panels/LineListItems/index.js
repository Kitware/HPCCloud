import React            from 'react';
import { itemFilter }   from '../../utils/Filters'
import style            from 'HPCCloudStyle/LineListItems.mcss';
import layout           from 'HPCCloudStyle/layout.css';

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
            <div className={ layout.verticalFlexContainer }>
                { filteredList.map( (item, idx) => {
                    return (
                        <div key={ item._id } className={ (idx % 2 === 0) ? style.even : style.odd }>
                            { React.createElement(this.props.itemRenderer, {item}) }
                        </div>);
                })}
            </div>);
    },
});
