import ChangeInfo from './ChangeInfo';
import ChangePassword from './ChangePassword';
import DetailView from '../../../panels/DetailView';
import PreferenceSubBar from '../../../panels/PreferenceSubBar';
import React from 'react';

export default React.createClass({

    displayName: 'Preferences/User',

    propTypes: {
        menu: React.PropTypes.array,
    },

    getDefaultProps() {
        return {
            menu: [
                {name: 'Change Password', component: ChangePassword},
                {name: 'Change Info', component: ChangeInfo},
            ],
        };
    },

    getInitialState() {
        return {
            active: 0,
        };
    },

    activeChange(active) {
        this.setState({active});
    },

    formAction(actionName) {
        this[actionName]();
    },

    render() {
        return <div>
            <PreferenceSubBar title='User'/>
            <DetailView
                onActiveChange={this.activeChange}
                active={this.state.active}
                contents={this.props.menu}>
                {React.createElement(this.props.menu[this.state.active].component, {})}
            </DetailView>
        </div>;
    },
});
