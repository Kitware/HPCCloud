import React                from 'react';
import ExecutionUnit        from './ExecutionUnit';
import style                from 'HPCCloudStyle/JobMonitor.mcss';

import { connect }  from 'react-redux';
import { dispatch }     from '../../redux';
import * as ClusterActions from '../../redux/actions/clusters';

const JobMonitor = React.createClass({
  displayName: 'JobMonitor',

  propTypes: {
    clusterId: React.PropTypes.string,
    tasks: React.PropTypes.array,
    jobs: React.PropTypes.array,
    user: React.PropTypes.object,

    taskflowLog: React.PropTypes.array,
    taskflowStatus: React.PropTypes.string,
    taskStatusCount: React.PropTypes.object,

    clusterOwner: React.PropTypes.object,
    clusterLog: React.PropTypes.array,
    clusterName: React.PropTypes.string,
    clusterStatus: React.PropTypes.string,

    getClusterLog: React.PropTypes.func,
    restrictedClusterLog: React.PropTypes.func,
  },

  getInitialState() {
    return {
      advanced: process.env.NODE_ENV === 'development',
    };
  },

  toggleAdvanced() {
    const advanced = !this.state.advanced;
    this.setState({ advanced });
  },

  clusterLogOpen(open) {
    if (open && this.props.user._id === this.props.clusterOwner) {
      const offset = this.props.clusterLog.length;
      this.props.getClusterLog(this.props.clusterId, offset);
    } else if (open && this.props.user._id !== this.props.clusterOwner) {
      console.log('restricted!');
      this.props.restrictedClusterLog(this.props.clusterId);
    }
  },

  render() {
    return (
      <div className={ style.container }>
          <div className={ style.toolbar }>
              <div className={ style.title }>
                  Jobs
              </div>
              <div className={ style.buttons }>
                  { Object.keys(this.props.taskStatusCount).map((status, index) =>
                    <span key={`${status}_${index}`} className={ style.count }>
                      {`${status}(${this.props.taskStatusCount[status]})` }
                    </span>
                  )}
                  <i
                    className={ this.state.advanced ? style.advancedIconOn : style.advancedIconOff}
                    onClick={ this.toggleAdvanced }
                   />
              </div>
          </div>
          <div className={ style.jobContent }>
            {
              this.props.jobs.map((job) =>
                <ExecutionUnit key={job._id} unit={job} />
              )
            }
          </div>
          <div className={ this.state.advanced ? style.taskflowContainer : style.hidden }>
              <div className={ style.toolbar }>
                  <div className={ style.title }>
                      Workflow tasks
                  </div>
                  <div className={ style.buttons } />
              </div>
              <div className={ style.taskflowContent }>
                {
                  this.props.tasks.map((task) =>
                    <ExecutionUnit key={task._id} unit={task} />
                  )
                }
              </div>
              <div className={ style.toolbar }>
                  <div className={ style.title }>
                      Workflow log
                  </div>
                  <div className={ style.buttons } />
              </div>
              <div className={ style.taskflowContent }>
                {
                  <ExecutionUnit unit={{ name: 'Log', log: this.props.taskflowLog, status: this.props.taskflowStatus }} />
                }
              </div>
              { this.props.clusterId ?
                <div>
                  <div className={ style.toolbar }>
                    <div className={ style.title }>
                        Cluster log
                    </div>
                    <div className={ style.buttons } />
                  </div>
                  <div className={ style.taskflowContent }>
                    {
                      <ExecutionUnit unit={{ name: this.props.clusterName, log: this.props.clusterLog, status: this.props.clusterStatus }}
                        onToggle={this.clusterLogOpen} alwaysShowLogToggle
                      />
                    }
                  </div>
                </div> : null
              }
          </div>
      </div>);
  },
});

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
    const cluster = clusterId ? state.preferences.clusters.mapById[clusterId] : null;
    const taskStatusCount = {};
    var taskflowStatus = '';
    var taskflowLog = [];
    var clusterOwner = '';
    var clusterLog = [];
    var clusterName = '';
    var clusterStatus = '';

    // get tasks and jobs
    if (taskflow && taskflow.taskMapById && taskflow.jobMapById) {
      // tasks
      taskflowStatus = taskflow.flow.status;
      tasks.push(...Object.keys(taskflow.taskMapById).map((id) => taskflow.taskMapById[id]));
      statusCounter(taskflow.taskMapById, taskStatusCount);
      // jobs
      jobs.push(...Object.keys(taskflow.jobMapById).map((id) => taskflow.jobMapById[id]));
      statusCounter(taskflow.jobMapById, taskStatusCount);
      taskflowLog = taskflow.log;
    }

    // Sort the tasks by created timestamp
    tasks.sort((task1, task2) => task1.created - task2.created);

    // get cluster status, logs, and stream state.
    if (cluster) {
      clusterName = cluster.name;
      clusterOwner = cluster.userId;
      clusterStatus = cluster.status;
      if (cluster.log && cluster.log.length) {
        clusterLog = cluster.log.sort((task1, task2) => task1.created - task2.created);
      }
    }

    return {
      user,
      tasks,
      jobs,
      taskflowLog,
      taskflowStatus,
      taskStatusCount,
      clusterOwner,
      clusterLog,
      clusterName,
      clusterStatus,
    };
  },
  () => ({
    getClusterLog: (id, offset) => dispatch(ClusterActions.getClusterLog(id, offset)),
    restrictedClusterLog: (id) => dispatch(ClusterActions.restrictedClusterLog(id)),
  })
)(JobMonitor);
