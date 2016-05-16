import React from 'react';
import CollapsibleWidget from 'paraviewweb/src/React/Widgets/CollapsibleWidget';
import ExecutionUnit  from '../../../panels/JobMonitor/ExecutionUnit';
import ButtonBar  from '../../../panels/ButtonBar';
import style      from 'HPCCloudStyle/JobMonitor.mcss';

export default React.createClass({
  displayName: 'ClusterStatus',

  propTypes: {
    title: React.PropTypes.string,
    status: React.PropTypes.string,
    simulation: React.PropTypes.object,
    clusterId: React.PropTypes.string,
    log: React.PropTypes.array,
    logToggle: React.PropTypes.func.isRequired,
    terminateCluster: React.PropTypes.func,
    deleteCluster: React.PropTypes.func,
  },

  barAction(action) {
    this[action]();
  },

  terminateCluster() {
    this.props.terminateCluster(this.props.clusterId);
  },

  deleteCluster() {
    this.props.logToggle(false);
    this.props.deleteCluster(this.props.clusterId);
  },

  render() {
    const actions = [];
    if (this.props.status === 'terminated') {
      actions.push({ name: 'deleteCluster', label: 'Delete Cluster' });
    } else if (this.props.status === 'running' || this.props.status === 'error') {
      actions.push({ name: 'terminateCluster', label: 'Terminate Cluster' });
    }

    return (<div className={style.logListItem}>
        <CollapsibleWidget
          open={false}
          title={ this.props.title }
          subtitle={ this.props.status }
          onChange={this.props.logToggle}
        >
          <p>Active Simulation: <em>{this.props.simulation.name}</em></p>
          { this.props.simulation.step ?
            <p>Step: <em>{this.props.simulation.step}</em></p>
            : null
          }
          <ExecutionUnit inline logOnly
            unit={{ name: 'Log', log: (this.props.log || []), status: '' }}
            open
          />
          <ButtonBar actions={actions} onAction={this.barAction} />
      </CollapsibleWidget>
    </div>);
  },
});
