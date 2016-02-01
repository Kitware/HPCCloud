import React from 'react';
import style from 'hpccloud/style/DetailView.mcss';

export default React.createClass({
    displayName: 'DetailView/DetailList',

    propTypes: {
        active: React.PropTypes.number,
        list: React.PropTypes.array,
        onActiveChange: React.PropTypes.func,
    },

    changeActive(event) {
        if (this.props.onActiveChange) {
            const newIndex = parseInt(event.target.dataset.index, 10);
            this.props.onActiveChange(newIndex);
        }
    },
    render() {
        var mapper = (el, index) => {
            return (<li key={el.name + '_' + index}
                className={style.detailListItem + ' ' + (this.props.active === index ? style.active : '')}
                data-index={index}
                onClick={this.changeActive}>
                {el.name}
            </li>);
        }
        return (<div className={style.detailList}>
            <ul>
                {this.props.list.map(mapper)}
            </ul>
        </div>);
    },
})
