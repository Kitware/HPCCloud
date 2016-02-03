import React    from 'react';

import states   from 'HPCCloudStyle/States.mcss';
import editor   from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({
    displayName: 'ButtonBar',

    propTypes: {
        actions: React.PropTypes.array,
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
            <div className={ editor.buttonGroup }>
                <span></span>
                <span className={ (this.props.error ? editor.errorBox : states.isHidden) }>
                    { this.props.error }
                </span>
                <div>
                    { this.props.actions.map(action => {
                        return <button
                                    className={ editor.button }
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
