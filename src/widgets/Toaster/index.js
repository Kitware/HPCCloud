import React from 'react';
import get   from '../../utils/get';
import style from 'HPCCloudStyle/Toaster.mcss';

import { connect }  from 'react-redux';
import { dispatch } from '../../redux';
import * as Actions from '../../redux/actions/network';

const ToastComponent = React.createClass({
  displayName: 'Toaster',

  propTypes: {
    errorId: React.PropTypes.string,
    message: React.PropTypes.string,
    invalidateError: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      errorId: null,
      message: '',
    };
  },

  close() {
    this.props.invalidateError(this.props.errorId);
  },

  render() {
    return (<div className={[style.ToastContainer, (this.props.errorId ? '' : style.isHidden)].join(' ')}>
        { this.props.message }
        <button className={style.ToastClearButton} onClick={ this.close }>
          <span className={style.CloseIcon}></span>
        </button>
      </div>);
  },
});


export default connect(
  state => {
    const localState = state.network;
    let id = null;
    let message = '';
    if (localState.activeErrors.application.length) {
      id = localState.activeErrors.application[0];
      if (get(localState, `error.${id}.resp.data`)) {
        message = localState.error[id].resp.data.message;
      } else if (get(localState, `error.${id}.resp.message`)) {
        message = localState.error[id].resp.message;
      } else {
        message = `${localState.error[id].resp.status}: ${localState.error[id].resp.statusText}`;
      }
      // the error doesn't necessarily get logged otherwise
      console.error(localState.error[id]);
    }

    return {
      errorId: id,
      message,
    };
  },
  () => ({
    invalidateError: (id) => dispatch(Actions.invalidateError(id, 'application')),
  })
)(ToastComponent);
