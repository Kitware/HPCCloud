import React                from 'react';
import CollapsibleWidget    from 'paraviewweb/src/React/Widgets/CollapsibleWidget';
import { formatTime }       from '../../utils/Format';
import style                from 'HPCCloudStyle/JobMonitor.mcss';

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

  onToggle(open) {
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
          <pre className={ style.log }>
          { // reduce log array to a string with formatted entries
            this.props.unit.log.reduce((prevVal, entry, index) => {
              let content = prevVal;
              let msg = entry.msg;
              if (msg !== null && typeof msg === 'object') {
                msg = JSON.stringify(msg, null, 2);
              }

              if (entry.status) {
                msg += ` [${entry.status}]`;
              }

              content += `[${formatTime(entry.created)}] ${entry.levelname}: ${msg}\n`;

              if (entry.exc_info) {
                content += entry.exc_info[2].join('');
                content += `${entry.exc_info[0]}: ${entry.exc_info[1]}`;
              }


              if (entry.data) {
                const data = JSON.stringify(entry.data, null, 2);
                content += `${data}\n`;
              }

              return content;
            }, '')
          }
          </pre>
        </CollapsibleWidget>
      </section>);
  },
});
