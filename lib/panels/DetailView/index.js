import React from 'react';
import DetailList from './DetailList';
import DetailtContent from './DetailContent';
import merge from 'mout/src/object/merge';
import style from './style.mcss';

export default React.createClass({
    displayName: 'DetailView',

    propTypes: {
        blankObject: React.PropTypes.object,
        component: React.PropTypes.func,
        contents: React.PropTypes.array,
    },

    getInitialState() {
        return {active: 0, contents: this.props.contents};
    },
    newActive(index) {
        this.setState({active:index});
    },
    newItem() {
        var contents = this.state.contents;
        contents.push(merge({}, this.props.blankObject));
        this.setState({contents, active: contents.length-1});
    },
    itemChange(newItem) {
        var contents = this.state.contents;
        contents[this.state.active] = newItem;
        this.setState({contents});
    },
    itemDelete() {
        var contents = this.state.contents,
            newActive;
        contents.splice(this.state.active, 1);
        if (this.state.active === 0 && contents.length > 0) {
            newActive = 0;
        } else if (this.state.active === 0) {
            newActive = null;
        } else {
            newActive = this.state.active-1;
        }
        this.setState({contents, active: newActive});
    },
    render() {
        var list = Object.keys(this.props.contents),
            contentItem = this.state.contents[list[this.state.active]];

        return (
            <div className={style.detailView}>
                <DetailList list={this.state.contents}
                    changeActive={this.newActive}
                    addItem={this.newItem}
                    active={this.state.active} />
                <DetailtContent componentData={contentItem}
                    component={this.props.component}
                    itemChange={this.itemChange}
                    itemDelete={this.itemDelete}/>
            </div>
        );
    },
})