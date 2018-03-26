import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import style from 'HPCCloudStyle/JobMonitor.mcss';

import ExecutionUnit from './ExecutionUnit';

import { dispatch } from '../../redux';
import * as ClusterActions from '../../redux/actions/clusters';
import * as VolumeActions from '../../redux/actions/volumes';

class JobMonitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      advanced: process.env.NODE_ENV === 'development',
    };
    this.toggleAdvanced = this.toggleAdvanced.bind(this);
    this.clusterLogOpen = this.clusterLogOpen.bind(this);
    this.volumeLogOpen = this.volumeLogOpen.bind(this);
  }

  toggleAdvanced() {
    const advanced = !this.state.advanced;
    this.setState({ advanced });
  }

  clusterLogOpen(open) {
    if (open && this.props.user._id === this.props.clusterOwner) {
      const offset = this.props.clusterLog.length;
      this.props.getClusterLog(this.props.clusterId, offset);
    } else if (open && this.props.user._id !== this.props.clusterOwner) {
      this.props.restrictedClusterLog(this.props.clusterId);
    }
  }

  volumeLogOpen(open) {
    if (open) {
      const offset = this.props.volumeLog.length;
      this.props.getVolumeLog(this.props.volumeId, offset);
    }
  }

  render() {
    return (
      <div className={style.container}>
        <div className={style.toolbar}>
          <div className={style.title}>Jobs</div>
          <div className={style.buttons}>
            {Object.keys(this.props.taskStatusCount).map((status, index) => (
              <span key={`${status}_${index}`} className={style.count}>
                {`${status}(${this.props.taskStatusCount[status]})`}
              </span>
            ))}
            <i
              className={
                this.state.advanced
                  ? style.advancedIconOn
                  : style.advancedIconOff
              }
              onClick={this.toggleAdvanced}
            />
          </div>
        </div>
        <div className={style.jobContent}>
          {this.props.jobs.map((job) => (
            <ExecutionUnit key={job._id} unit={job} />
          ))}
        </div>
        <div
          className={
            this.state.advanced ? style.taskflowContainer : style.hidden
          }
        >
          <div className={style.toolbar}>
            <div className={style.title}>Workflow tasks</div>
            <div className={style.buttons} />
          </div>
          <div className={style.taskflowContent}>
            {this.props.tasks.map((task) => (
              <ExecutionUnit key={task._id} unit={task} />
            ))}
          </div>
          <div className={style.toolbar}>
            <div className={style.title}>Workflow log</div>
            <div className={style.buttons} />
          </div>
          <div className={style.taskflowContent}>
            {
              <ExecutionUnit
                unit={{
                  name: 'Log',
                  log: this.props.taskflowLog,
                  status: this.props.taskflowStatus,
                }}
              />
            }
          </div>
          {this.props.clusterId ? (
            <div>
              <div className={style.toolbar}>
                <div className={style.title}>Cluster log</div>
                <div className={style.buttons} />
              </div>
              <div className={style.taskflowContent}>
                {
                  <ExecutionUnit
                    unit={{
                      name: this.props.clusterName,
                      log: this.props.clusterLog,
                      status: this.props.clusterStatus,
                    }}
                    onToggle={this.clusterLogOpen}
                    alwaysShowLogToggle
                  />
                }
              </div>
            </div>
          ) : null}
          {this.props.volumeId ? (
            <div>
              <div className={style.toolbar}>
                <div className={style.title}>Volume log</div>
                <div className={style.buttons} />
              </div>
              <div className={style.taskflowContent}>
                {
                  <ExecutionUnit
                    unit={{
                      name: this.props.volumeName,
                      log: this.props.volumeLog,
                      status: this.props.volumeStatus,
                    }}
                    onToggle={this.volumeLogOpen}
                    alwaysShowLogToggle
                  />
                }
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

JobMonitor.propTypes = {
  tasks: PropTypes.array,
  jobs: PropTypes.array,
  user: PropTypes.object,

  taskflowLog: PropTypes.array,
  taskflowStatus: PropTypes.string,
  taskStatusCount: PropTypes.object,

  clusterId: PropTypes.string,
  clusterOwner: PropTypes.string,
  clusterLog: PropTypes.array,
  clusterName: PropTypes.string,
  clusterStatus: PropTypes.string,

  volumeId: PropTypes.string,
  volumeName: PropTypes.string,
  volumeStatus: PropTypes.string,
  volumeLog: PropTypes.array,

  getClusterLog: PropTypes.func,
  getVolumeLog: PropTypes.func,
  restrictedClusterLog: PropTypes.func,
};

JobMonitor.defaultProps = {
  tasks: undefined,
  jobs: undefined,
  user: undefined,

  taskflowLog: undefined,
  taskflowStatus: undefined,
  taskStatusCount: undefined,

  clusterId: undefined,
  clusterOwner: undefined,
  clusterLog: undefined,
  clusterName: undefined,
  clusterStatus: undefined,

  volumeId: undefined,
  volumeName: undefined,
  volumeStatus: undefined,
  volumeLog: undefined,

  getClusterLog: undefined,
  getVolumeLog: undefined,
  restrictedClusterLog: undefined,
};

// manipulates target's status count
function statusCounter(source, target) {
  Object.keys(source).forEach((id) => {
    const status = source[id].status;
    if (target[status]) {
      target[status] += 1;
    } else {
      target[status] = 1;
    }
  });
}

// Binding --------------------------------------------------------------------
export default connect(
  (state, props) => {
    const user = state.auth.user;
    const taskflowId = props.taskflowId;
    const clusterId = props.clusterId;
    const taskflow = taskflowId ? state.taskflows.mapById[taskflowId] : null;
    const tasks = [];
    const jobs = [];
    const cluster = clusterId
      ? state.preferences.clusters.mapById[clusterId]
      : null;
    const taskStatusCount = {};
    let taskflowStatus = '';
    let taskflowLog = [];
    let clusterOwner = '';
    let clusterLog = [];
    let clusterName = '';
    let clusterStatus = '';
    let volumeName = '';
    let volumeStatus = '';
    let volumeLog = [];

    // get tasks and jobs
    if (taskflow && taskflow.taskMapById && taskflow.jobMapById) {
      // tasks
      taskflowStatus = taskflow.flow.status;
      tasks.push(
        ...Object.keys(taskflow.taskMapById).map(
          (id) => taskflow.taskMapById[id]
        )
      );
      statusCounter(taskflow.taskMapById, taskStatusCount);
      // jobs
      jobs.push(
        ...Object.keys(taskflow.jobMapById).map((id) => taskflow.jobMapById[id])
      );
      statusCounter(taskflow.jobMapById, taskStatusCount);
      taskflowLog = taskflow.log;
    }

    const volumeId = state.preferences.volumes.mapByClusterId[clusterId];
    if (volumeId) {
      volumeName = state.preferences.volumes.mapById[volumeId].name;
      volumeStatus = state.preferences.volumes.mapById[volumeId].status;
      volumeLog = state.preferences.volumes.logById[volumeId] || [];
    }

    // Sort the tasks by created timestamp
    tasks.sort((task1, task2) => task1.created - task2.created);

    // get cluster status, logs, and stream state.
    if (cluster) {
      clusterName = cluster.name;
      clusterOwner = cluster.userId;
      clusterStatus = cluster.status;
      if (cluster.log && cluster.log.length) {
        clusterLog = cluster.log.sort(
          (task1, task2) => task1.created - task2.created
        );
      }
    }

    return {
      user,
      tasks,
      jobs,
      taskflowLog,
      taskflowStatus,
      taskStatusCount,
      clusterName,
      clusterStatus,
      clusterLog,
      clusterOwner,
      volumeId,
      volumeName,
      volumeStatus,
      volumeLog,
    };
  },
  () => ({
    getClusterLog: (id, offset) =>
      dispatch(ClusterActions.getClusterLog(id, offset)),
    getVolumeLog: (id, offset) =>
      dispatch(VolumeActions.getVolumeLog(id, offset)),
    restrictedClusterLog: (id) =>
      dispatch(ClusterActions.restrictedClusterLog(id)),
  })
)(JobMonitor);
