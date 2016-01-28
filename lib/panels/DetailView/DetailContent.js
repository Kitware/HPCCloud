import React from 'react';
import style from './style.mcss';

export default React.createClass({
    displayName: 'DetailView/ContentView',

    propTypes: {
        children: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.array]),
    },

    render() {
        return (
            <section className={style.detailContent}>
                { this.props.children }
            </section>);
    },
})
