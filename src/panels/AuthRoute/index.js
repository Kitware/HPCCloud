import React from 'react';
import PropTypes from 'prop-types';

import { Route, Redirect } from 'react-router-dom';

import client from '../../network';

// ----------------------------------------------------------------------------

function isLoggedIn() {
  return !!client.getLoggedInUser();
}

// ----------------------------------------------------------------------------

function isAdmin() {
  if (isLoggedIn()) {
    const user = client.getLoggedInUser();
    return user.admin;
  }
  return false;
}

// ----------------------------------------------------------------------------

export default function AuthRoute({
  component: Component,
  redirectTo,
  admin,
  path,
  exact,
}) {
  return (
    <Route
      path={path}
      exact={exact}
      render={(props) =>
        (admin ? (
          isAdmin()
        ) : (
          isLoggedIn()
        )) ? (
          <Component {...props} />
        ) : (
          <Redirect to={redirectTo} />
        )
      }
    />
  );
}

AuthRoute.propTypes = {
  component: PropTypes.func.isRequired,
  admin: PropTypes.bool,
  redirectTo: PropTypes.string,
  path: PropTypes.string.isRequired,
  exact: PropTypes.bool,
};

AuthRoute.defaultProps = {
  admin: false,
  redirectTo: '/',
  exact: false,
};
