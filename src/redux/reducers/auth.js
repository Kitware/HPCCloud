import * as Actions from '../actions/user';

export const initialState = {
  pending: false,
  user: null,
  userMap: {},
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case Actions.LOGGED_IN: {
      return Object.assign({}, state, { user: action.user });
    }

    case Actions.AUTH_PENDING: {
      return Object.assign({}, state, { pending: action.pending });
    }

    case Actions.LOGOUT: {
      return initialState;
    }

    case Actions.GET_USERS: {
      const users = {};
      action.users.forEach((u) => {
        users[u._id] = u;
      });
      return Object.assign({}, state, { userMap: users });
    }

    default:
      return state;
  }
}
