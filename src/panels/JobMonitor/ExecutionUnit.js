import React                from 'react';
import CollapsibleWidget    from 'paraviewweb/src/React/Widgets/CollapsibleWidget';
import { formatTime }       from '../../utils/Format';
import style                from 'HPCCloudStyle/JobMonitor.mcss';

export default React.createClass({
  displayName: 'ExecutionUnit',

  propTypes: {
    unit: React.PropTypes.object,
  },


  render() {
    if (this.props.unit.log === undefined || this.props.unit.log.length === 0) {
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
            open={false}
          >
            <pre className={ style.log }>
            { // reduce log array to a string with formatted entries
              this.props.unit.log.reduce((prevVal, entry, index) => {
                var content = prevVal;
                content += `[${formatTime(entry.created)}] ${entry.levelname}: ${entry.msg}\n`;

                if (entry.exc_info) {
                  content += entry.exc_info[2].join('');
                  content += `${entry.exc_info[0]}: ${entry.exc_info[1]}`;
                }

                return content;
              }, '')
            }
            </pre>
          </CollapsibleWidget>
          </section>);
  },
});
