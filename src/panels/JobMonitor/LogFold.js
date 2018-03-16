import React from 'react';
import PropTypes from 'prop-types';

import style from 'HPCCloudStyle/JobMonitor.mcss';
import state from 'HPCCloudStyle/States.mcss';

export default class LogFold extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.toggleOpen = this.toggleOpen.bind(this);
  }

  toggleOpen() {
    this.setState({ open: !this.state.open });
  }

  render() {
    return (
      <div className={`${style.logEntry} ${this.props.color}`}>
        {this.state.open ? (
          <i className={style.foldOpen} onClick={this.toggleOpen} />
        ) : (
          <i className={style.foldClosed} onClick={this.toggleOpen} />
        )}
        {this.props.header}
        <div className={this.state.open ? '' : state.isHidden}>
          {this.props.content}
        </div>
      </div>
    );
  }
}

LogFold.propTypes = {
  header: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  color: PropTypes.string,
};

LogFold.defaultProps = {
  color: '',
};
