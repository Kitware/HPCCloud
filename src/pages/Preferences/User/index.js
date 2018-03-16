import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import style from 'HPCCloudStyle/PageWithMenu.mcss';

import ChangeInfo from './ChangeInfo';
import ChangePassword from './ChangePassword';
import ActiveList from '../../../panels/ActiveList';
import Toolbar from '../../../panels/Toolbar';

import { breadcrumb } from '..';

class UserPref extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: 0,
    };

    this.activeChange = this.activeChange.bind(this);
    this.formAction = this.formAction.bind(this);
  }

  activeChange(active) {
    this.setState({ active });
  }

  formAction(actionName) {
    this[actionName]();
  }

  render() {
    const userBreadCrumb = breadcrumb(this.props.user, 'User');
    return (
      <div className={style.rootContainer}>
        <Toolbar title="User" breadcrumb={userBreadCrumb} hasTabs />
        <div className={style.container}>
          <ActiveList
            className={style.menu}
            onActiveChange={this.activeChange}
            active={this.state.active}
            list={this.props.menu}
          />
          {React.createElement(this.props.menu[this.state.active].component, {
            className: style.content,
          })}
        </div>
      </div>
    );
  }
}

UserPref.propTypes = {
  menu: PropTypes.array,
  user: PropTypes.object,
};

UserPref.defaultProps = {
  menu: [
    {
      name: 'Change Password',
      component: ChangePassword,
    },
    {
      name: 'Change Info',
      component: ChangeInfo,
    },
  ],
  user: undefined,
};

export default connect(
  (state) => ({
    user: state.auth.user,
  }),
  () => ({})
)(UserPref);
