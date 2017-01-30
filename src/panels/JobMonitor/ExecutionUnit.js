import React             from 'react';
import CollapsibleWidget from 'paraviewweb/src/React/Widgets/CollapsibleWidget';
import LogFold           from './LogFold';
import { formatTime }    from '../../utils/Format';
import style             from 'HPCCloudStyle/JobMonitor.mcss';
import get               from '../../utils/get';

// takes log array -> jsx lines, or if there's more information LogFold
function logMapper(entry, index) {
  if (!entry) {
    return null;
  }
  let content = '';
  let foldContent = null;
  let msg = entry.msg;
  let color = '';
  if (msg !== null && typeof msg === 'object') {
    msg = JSON.stringify(msg, null, 2);
  }

  if (entry.status) {
    msg += ` [${entry.status}]`;
  }

  if (entry.levelname === 'WARNING') {
    color = style.logWarn;
  } else if (entry.levelname === 'ERROR') {
    color = style.logError;
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
      header={content} content={foldContent} color={color} />);
  }

  return (<p key={`${entry.created}_${index}`} className={`${style.logEntry} ${color}`}>
    {content}
  </p>);
}

export default React.createClass({
  displayName: 'ExecutionUnit',

  propTypes: {
    unit: React.PropTypes.object.isRequired,
    // optionals
    onToggle: React.PropTypes.func,
    alwaysShowLogToggle: React.PropTypes.bool,
    inline: React.PropTypes.bool,
    logOnly: React.PropTypes.bool,
    open: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      alwaysShowLogToggle: false,
      inline: false,
      logOnly: false,
      open: false,
    };
  },

  getInitialState() {
    return { open: this.props.open };
  },

  componentWillUpdate(nextProps, nextState) {
    // we want to update other stuff, but if the unit log is empty, ignore it.
    if (get(nextProps, 'unit.log.length') < get(this.props, 'unit.log.length')) {
      nextProps.unit.log = (this.props.unit.log || []).concat(nextProps.unit.log);
    }
  },

  componentDidUpdate(prevProps, prevState) {
    // the <pre> needs to be rendered open to have scrollHeight, then it scrolls
    if (this.state.open && this.log) {
      this.log.scrollTop = this.log.scrollHeight;
    }
  },

  onToggle(open) {
    this.setState({ open });
    if (this.props.onToggle) {
      this.props.onToggle(open);
    }
  },

  render() {
    const title = this.props.unit.name ? this.props.unit.name.split('.').pop() : 'Log';

    if (!this.props.alwaysShowLogToggle &&
      (this.props.unit.log === undefined || this.props.unit.log.length === 0)) {
      return (
        <section className={ style.listItem }>
          <strong className={ style.itemContent }>{ title }</strong>
          <div className={ style.itemContent }>{this.props.unit.status}</div>
        </section>
      );
    }

    const log = (<pre className={ style.log } ref={(c) => {this.log = c;}}>
      { // reduce log array to a string with formatted entries
        this.props.unit.log.map(logMapper)
      }
      </pre>);

    if (this.props.logOnly) {
      return log;
    }

    return (
      <section className={ !this.props.inline ? style.logListItem : ''}>
        <CollapsibleWidget
          title={ title }
          subtitle={this.props.unit.status}
          open={this.state.open}
          onChange={this.onToggle}
        >
          { log }
        </CollapsibleWidget>
      </section>);
  },
});
