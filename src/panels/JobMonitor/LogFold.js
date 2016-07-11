import React from 'react';
import style from 'HPCCloudStyle/JobMonitor.mcss';
import state from 'HPCCloudStyle/States.mcss';

export default React.createClass({
  displayName: 'LogFold',

  propTypes: {
    header: React.PropTypes.string.isRequired,
    content: React.PropTypes.string.isRequired,
    color: React.PropTypes.string,
  },

  getDefaultProps() {
    return { color: '' };
  },

  getInitialState() {
    return { open: false };
  },

  toggleOpen() {
    this.setState({ open: !this.state.open });
  },

  render() {
    return (<div className={`${style.logEntry} ${this.props.color}`}>
        {this.state.open ?
          <i className={style.foldOpen} onClick={this.toggleOpen}></i> :
          <i className={style.foldClosed} onClick={this.toggleOpen}></i>
        }
        { this.props.header }
        <div className={this.state.open ? '' : state.isHidden}>
          { this.props.content}
        </div>
      </div>);
  },
});
