import React from 'react';
import style from 'hpccloud/style/DetailView.mcss';

export default React.createClass({
    displayName: 'DetailView/ContentView',

    propTypes: {
        children: React.PropTypes.oneOfType([
            React.PropTypes.func,
            React.PropTypes.array,
            React.PropTypes.object,
        ]),
    },

    render() {
        return (
            <section className={style.detailContent}>
                { this.props.children }
            </section>);
    },
})
