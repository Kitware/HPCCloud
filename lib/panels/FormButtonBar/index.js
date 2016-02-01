import React from 'react';
import style from 'hpccloud/style/FormButtonBar.mcss';

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
            <div className={ style.buttonBar }>
                <span></span>
                <span className={ style.error + (this.props.error ? '' : ' is-hidden')}>
                    { this.props.error }
                </span>
                <div className={ style.buttons }>
                    { this.props.actionList.map(action => {
                        return <button className={style.btn}
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
