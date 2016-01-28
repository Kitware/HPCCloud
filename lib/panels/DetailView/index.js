import React from 'react';
import DetailList from './DetailList';
import DetailtContent from './DetailContent';
import style from './style.mcss';

export default React.createClass({
    displayName: 'DetailView',

    propTypes: {
        active: React.PropTypes.number,
        component: React.PropTypes.func,
        contents: React.PropTypes.array,
        itemChange: React.PropTypes.func,
        itemDelete: React.PropTypes.func,
        itemSave: React.PropTypes.func,
        newActive: React.PropTypes.func,
    },

    newActive(index) {
        if (this.props.newActive) {
            this.props.newActive(index);
        }
    },
    itemChange(newItem) {
        if (this.props.itemChange) {
            this.props.itemChange(newItem);
        }
    },
    itemSave(newItem){
        if (this.props.itemSave) {
            this.props.itemSave(newItem);
        }
    },
    itemDelete() {
        if (this.props.itemDelete) {
            this.props.itemDelete();
        }
    },
    render() {
        var contentItem = this.props.contents[this.props.active];

        return (
            <div className={style.detailView}>
                <DetailList list={this.props.contents}
                    changeActive={this.newActive}
                    addItem={this.newItem}
                    active={this.props.active} />
                <DetailtContent componentData={contentItem}
                    component={this.props.component}
                    itemChange={this.itemChange}
                    itemDelete={this.itemDelete}/>
            </div>
        );
    },
})