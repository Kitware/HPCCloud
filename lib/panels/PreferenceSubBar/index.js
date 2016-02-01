import React    from 'react';
import style    from 'hpccloud/style/PreferenceSubBar.mcss';
import { Link } from 'react-router';

export default React.createClass({
    displayName: 'PreferenceSubBar',

    propTypes: {
        actionList: React.PropTypes.array,
        onAction: React.PropTypes.func,
        title: React.PropTypes.string,
    },

    getDefaultProps() {
        return {
            actionList: [],
            title: 'Preferences',
        };
    },

    onAction(event) {
        const action = event.target.dataset.action;
        if (this.props.onAction) {
            this.props.onAction(action);
        }
    },

    render() {
        return (
            <nav className={ style.subBar }>
                <Link to='/Preferences'><i className="fa fa-th"></i></Link>
                <div className={ style.title }>
                    { this.props.title }
                </div>
                <div className={ style.actions }>
                    { this.props.actionList.map(action => {
                        return <i key={action.name} data-action={action.name} onClick={this.onAction} className={ action.icon }></i>;
                    })}
                </div>
            </nav>);
    },
})
