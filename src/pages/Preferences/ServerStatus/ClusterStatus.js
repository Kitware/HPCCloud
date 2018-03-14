import React from 'react';
import CollapsibleWidget from 'paraviewweb/src/React/Widgets/CollapsibleWidget';
import ExecutionUnit from '../../../panels/JobMonitor/ExecutionUnit';
import ButtonBar from '../../../panels/ButtonBar';
import { getActions } from '../../../utils/getDisabledButtons';
import style from 'HPCCloudStyle/JobMonitor.mcss';

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
    disabledButtons: React.PropTypes.object,
    noControls: React.PropTypes.bool,
  },

  getDefaultProps() {
    return { disabledButtons: {} };
  },

  onTerminateInstance() {
    this.props.terminateCluster(this.props.clusterId);
  },

  onDeleteCluster() {
    this.props.logToggle(false);
    this.props.deleteCluster(this.props.clusterId);
  },

  barAction(action) {
    this[action]();
  },

  render() {
    let actions = [];
    if (this.props.status === 'terminated') {
      actions = getActions(['deleteCluster'], this.props.disabledButtons);
    } else if (
      this.props.status === 'running' ||
      this.props.status === 'error'
    ) {
      actions = getActions(['terminateInstance'], this.props.disabledButtons);
    }

    return (
      <div className={style.logListItem}>
        <CollapsibleWidget
          open={false}
          title={this.props.title}
          subtitle={this.props.status}
          onChange={this.props.logToggle}
        >
          {this.props.simulation ? (
            <div>
              <p>
                Active Simulation: <em>{this.props.simulation.name}</em>
              </p>
              {this.props.simulation.step ? (
                <p>
                  Step: <em>{this.props.simulation.step}</em>
                </p>
              ) : null}
            </div>
          ) : null}
          <ExecutionUnit
            inline
            logOnly
            unit={{ name: 'Log', log: this.props.log || [], status: '' }}
            open
          />
          {!this.props.noControls ? (
            <ButtonBar actions={actions} onAction={this.barAction} />
          ) : null}
        </CollapsibleWidget>
      </div>
    );
  },
});
