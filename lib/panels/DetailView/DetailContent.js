import React from 'react';
import style from './style.mcss';

export default React.createClass({
    displayName: 'DetailView/ContentView',

    propTypes: {
        component: React.PropTypes.func,
        componentData: React.PropTypes.object,
        itemChange: React.PropTypes.func,
        itemDelete: React.PropTypes.func,
    },

    itemChange(newItem) {
        if (this.props.itemChange) {
            this.props.itemChange(newItem);
        }
    },
    itemDelete(event) {
        if (this.props.itemDelete) {
            this.props.itemDelete();
        }
    },
    render() {
        var ret;
        if (this.props.componentData) {
        ret = (
            <section className={style.detailContent}>
                { React.createElement(this.props.component,
                    {
                        data: this.props.componentData,
                        itemChange: this.props.itemChange,
                    })}
                <div className={style.buttonLine}>
                    <button onClick={this.itemSave}>Save <i className="fa fa-floppy-o"></i></button>
                    <button onClick={this.itemDelete}>Delete <i className="fa fa-trash"></i></button>
                </div>
            </section>);
        } else {
            ret = (<div></div>)
        }
        return ret;
    },
})