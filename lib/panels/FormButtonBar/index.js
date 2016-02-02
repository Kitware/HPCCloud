import React from 'react';
import theme from 'HPCCloudStyle/theme.mcss';
import states from 'HPCCloudStyle/states.css';
import form from 'HPCCloudStyle/form.css';

export default React.createClass({
    displayName: 'FormButtonBar',

    propTypes: {
        actionList: React.PropTypes.array,
        error: React.PropTypes.string,
        onAction: React.PropTypes.func,
        visible: React.PropTypes.bool,
    },

    getDefaultProps() {
        return {
            visible: true,
        };
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
            <div className={ form.buttonGroup }>
                <span></span>
                <span className={ (this.props.error ? theme.errorBox : states.isHidden) }>
                    { this.props.error }
                </span>
                <div>
                    { this.props.actionList.map(action => {
                        return <button className={theme.btn}
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
