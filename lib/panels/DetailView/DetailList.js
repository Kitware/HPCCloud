import React from 'react';
import style from './style.mcss';

export default React.createClass({
    displayName: 'DetailView/DetailList',

    propTypes: {
        active: React.PropTypes.number,
        addItem: React.PropTypes.func,
        changeActive: React.PropTypes.func,
        list: React.PropTypes.array,
    },

    changeActive(event) {
        if (this.props.changeActive) {
            const newIndex = parseInt(event.target.dataset.index, 10);
            this.props.changeActive(newIndex);
        }
    },
    addItem() {
        if (this.props.addItem) {
            this.props.addItem();
        }
    },
    render() {
        var mapper = (el, index) => {
            return (<li key={el + '_' + index}
                className={this.props.active === index ? style.active : ''}
                data-index={index}
                onClick={this.changeActive}>
                {el.name}
            </li>);
        }
        return (<div className={style.detailList}>
            <ul>
                {this.props.list.map(mapper)}
            </ul>
            <button onClick={this.addItem}>+</button>
        </div>);
    },
})