import React from 'react';
import style from 'HPCCloudStyle/Toolbar.mcss';

export default React.createClass({
    displayName: 'IconActionList',

    propTypes: {
        actions: React.PropTypes.array,
        className: React.PropTypes.string,
        onAction: React.PropTypes.func,
    },

    getDefaultProps() {
        return {
            actions: [],
            className: '',
        };
    },

    onAction(event) {
        const action = event.target.dataset.action;
        if (this.props.onAction) {
            this.props.onAction(action);
        }
    },

    render() {
        return (<div className={ this.props.className }>
            { this.props.actions.map(action => {
                return  <i key={action.name}
                            data-action={action.name}
                            onClick={this.onAction}
                            className={ [ style.actionButton, action.icon ].join(' ') }>
                        </i>;
            })}
            </div>);
    },
})
