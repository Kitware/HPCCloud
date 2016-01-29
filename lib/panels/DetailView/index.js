import React from 'react';
import DetailList from './DetailList';
import DetailtContent from './DetailContent';
import style from './style.mcss';

export default React.createClass({
    displayName: 'DetailView',

    propTypes: {
        active: React.PropTypes.number,
        children: React.PropTypes.oneOfType([
            React.PropTypes.func,
            React.PropTypes.array,
            React.PropTypes.object,
        ]),
        contents: React.PropTypes.array,
        onActiveChange: React.PropTypes.func,
    },

    render() {
        return (
            <div className={style.detailView}>
                <DetailList
                    list={this.props.contents}
                    onActiveChange={this.props.onActiveChange}
                    active={this.props.active} />
                <DetailtContent>
                    { this.props.children }
                </DetailtContent>
            </div>
        );
    },
})
