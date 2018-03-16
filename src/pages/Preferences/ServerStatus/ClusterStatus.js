import React from 'react';
import PropTypes from 'prop-types';

import CollapsibleWidget from 'paraviewweb/src/React/Widgets/CollapsibleWidget';

import style from 'HPCCloudStyle/JobMonitor.mcss';

import ExecutionUnit from '../../../panels/JobMonitor/ExecutionUnit';
import ButtonBar from '../../../panels/ButtonBar';
import { getActions } from '../../../utils/getDisabledButtons';

export default class ClusterStatus extends React.Component {
  constructor(props) {
    super(props);

    this.onTerminateInstance = this.onTerminateInstance.bind(this);
    this.onDeleteCluster = this.onDeleteCluster.bind(this);
    this.barAction = this.barAction.bind(this);
  }

  onTerminateInstance() {
    this.props.terminateCluster(this.props.clusterId);
  }

  onDeleteCluster() {
    this.props.logToggle(false);
    this.props.deleteCluster(this.props.clusterId);
  }

  barAction(action) {
    this[action]();
  }

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
  }
}

ClusterStatus.propTypes = {
  title: PropTypes.string,
  status: PropTypes.string,
  simulation: PropTypes.object,
  clusterId: PropTypes.string,
  log: PropTypes.array,
  logToggle: PropTypes.func.isRequired,
  terminateCluster: PropTypes.func,
  deleteCluster: PropTypes.func,
  disabledButtons: PropTypes.object,
  noControls: PropTypes.bool,
};

ClusterStatus.defaultProps = {
  title: undefined,
  status: undefined,
  simulation: undefined,
  clusterId: undefined,
  log: [],
  terminateCluster: undefined,
  deleteCluster: undefined,
  disabledButtons: {},
  noControls: false,
};
