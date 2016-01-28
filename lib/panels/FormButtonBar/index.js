import React from 'react';
import style from './FormButtonBar.mcss';

export default React.createClass({
    displayName: 'FormButtonBar',

    propTypes: {
        actionList: React.PropTypes.array,
        error: React.PropTypes.string,
        onAction: React.PropTypes.func,
        visible: React.PropTypes.bool,
    },

    onAction(event) {
        const action = event.target.dataset.action;
        if (this.props.onAction) {
            this.props.onAction(action);
        }
    },

    render() {
        if(!this.props.visible) {
            return null;
        }
        return (
            <div className={ style.buttomBar }>
                <span className={ style.error }>
                    { this.props.error }
                </span>
                <div className={ style.buttons }>
                    { this.props.actionList.map(action => {
                        return <button
                                    key={action.name}
                                    data-action={action.name}
                                    onClick={this.onAction}>
                                        { action.label } <i className={ action.icon }></i>
                                </button>;
                    })}
                </div>
            </div>);
    },
})
