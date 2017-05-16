import ChangeInfo       from './ChangeInfo';
import ChangePassword   from './ChangePassword';
import ActiveList       from '../../../panels/ActiveList';
import Toolbar          from '../../../panels/Toolbar';
import React            from 'react';
import { breadcrumb }   from '..';

import style from 'HPCCloudStyle/PageWithMenu.mcss';
import { connect }  from 'react-redux';

const UserPref = React.createClass({

  displayName: 'Preferences/User',

  propTypes: {
    menu: React.PropTypes.array,
    user: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      menu: [
        {
          name: 'Change Password',
          component: ChangePassword,
        }, {
          name: 'Change Info',
          component: ChangeInfo,
        },
      ],
    };
  },

  getInitialState() {
    return {
      active: 0,
    };
  },

  activeChange(active) {
    this.setState({ active });
  },

  formAction(actionName) {
    this[actionName]();
  },

  render() {
    const userBreadCrumb = breadcrumb(this.props.user, 'User');
    return (
      <div className={ style.rootContainer }>
        <Toolbar title="User" breadcrumb={userBreadCrumb} hasTabs />
        <div className={ style.container }>
            <ActiveList
              className={ style.menu }
              onActiveChange={this.activeChange}
              active={this.state.active}
              list={this.props.menu}
            />
            { React.createElement(this.props.menu[this.state.active].component, { className: style.content }) }
        </div>
      </div>);
  },
});

export default connect(
  (state) => ({
    user: state.auth.user,
  }),
  () => ({})
)(UserPref);
