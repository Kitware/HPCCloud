import React                from 'react';
import CollapsibleWidget    from 'paraviewweb/src/React/Widgets/CollapsibleWidget';
import LogFold              from './LogFold';
import { formatTime }       from '../../utils/Format';
import style                from 'HPCCloudStyle/JobMonitor.mcss';

// takes log array -> jsx lines, or if there's more information LogFold
function logMapper(entry, index) {
  let content = '';
  let foldContent = null;
  let msg = entry.msg;
  if (msg !== null && typeof msg === 'object') {
    msg = JSON.stringify(msg, null, 2);
  }

  if (entry.status) {
    msg += ` [${entry.status}]`;
  }

  content += `[${formatTime(entry.created)}] ${entry.levelname}: ${msg}`;

  if (entry.exc_info) {
    foldContent = entry.exc_info[2].join('');
    foldContent += `${entry.exc_info[0]}: ${entry.exc_info[1]}`;
  }

  if (entry.data && Object.keys(entry.data).length > 0) {
    foldContent = `${JSON.stringify(entry.data, null, 2)}`;
  }

  if (foldContent !== null) {
    return (<LogFold key={`${entry.created}_${index}`}
      header={content} content={foldContent} />);
  }

  return (<p key={`${entry.created}_${index}`} className={style.logEntry}>
    {content}
  </p>);
}

export default React.createClass({
  displayName: 'ExecutionUnit',

  propTypes: {
    unit: React.PropTypes.object,
    open: React.PropTypes.bool,
    onToggle: React.PropTypes.func,
    alwaysShowLogToggle: React.PropTypes.bool,
  },

  getDefaultProps() {
    return { open: false, alwaysShowLogToggle: false };
  },

  getInitialState() {
    return { open: this.props.open };
  },

  componentDidUpdate(prevProps, prevState) {
    // the <pre> needs to be rendered open to have scrollHeight, then it scrolls
    if ((!prevState.open && this.state.open) ||
      this.state.open && prevProps.unit.log.length < this.props.unit.log.length) {
      this.refs.log.scrollTop = this.refs.log.scrollHeight;
    }
  },

  onToggle(open) {
    this.setState({ open });
    if (this.props.onToggle) {
      this.props.onToggle(open);
    }
  },

  render() {
    if (!this.props.alwaysShowLogToggle &&
      (this.props.unit.log === undefined || this.props.unit.log.length === 0)) {
      return (
        <section className={ style.listItem }>
          <strong className={ style.itemContent }>{this.props.unit.name.split('.').pop()}</strong>
          <div className={ style.itemContent }>{this.props.unit.status}</div>
        </section>
      );
    }

    return (
      <section className={ style.logListItem }>
        <CollapsibleWidget
          title={this.props.unit.name.split('.').pop()}
          subtitle={this.props.unit.status}
          open={this.state.open}
          onChange={this.onToggle}
        >
          <pre className={ style.log } ref="log">
          { // reduce log array to a string with formatted entries
            this.props.unit.log.map(logMapper)
          }
          </pre>
        </CollapsibleWidget>
      </section>);
  },
});
