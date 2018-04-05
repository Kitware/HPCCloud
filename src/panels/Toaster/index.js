import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import style from 'HPCCloudStyle/Toaster.mcss';

import get from '../../utils/get';

import { dispatch } from '../../redux';
import * as Actions from '../../redux/actions/network';

class ToastComponent extends React.Component {
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
  }

  close() {
    this.props.invalidateError(this.props.errorId);
  }

  render() {
    return (
      <div
        className={[
          style.ToastContainer,
          this.props.errorId ? '' : style.isHidden,
        ].join(' ')}
      >
        {this.props.message}
        <button className={style.ToastClearButton} onClick={this.close}>
          <span className={style.CloseIcon} />
        </button>
      </div>
    );
  }
}

ToastComponent.propTypes = {
  errorId: PropTypes.string,
  message: PropTypes.string,
  invalidateError: PropTypes.func.isRequired,
};

ToastComponent.defaultProps = {
  errorId: null,
  message: '',
};

export default connect(
  (state) => {
    const localState = state.network;
    let id = null;
    let message = '';
    if (localState.activeErrors.application.length) {
      id = localState.activeErrors.application[0];
      if (get(localState, `error.${id}.resp.message`)) {
        message = localState.error[id].resp.message;
      } else if (get(localState, `error.${id}.resp.data.message`)) {
        message = localState.error[id].resp.data.message;
      } else if (get(localState, `error.${id}.resp.data`)) {
        message = localState.error[id].resp.data;
      } else {
        message = `${localState.error[id].resp.status}: ${
          localState.error[id].resp.statusText
        }`;
      }
      // the error doesn't necessarily get logged otherwise
      console.error(localState.error[id]);
      if (localState.error[id].label) {
        message = `${localState.error[id].label}: ${message}`;
      }
    }

    return {
      errorId: id,
      message,
    };
  },
  () => ({
    invalidateError: (id) =>
      dispatch(Actions.invalidateError(id, 'application')),
  })
)(ToastComponent);
