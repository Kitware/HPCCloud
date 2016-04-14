import React                from 'react';
import ExecutionUnit        from './ExecutionUnit.js';
import style                from 'HPCCloudStyle/JobMonitor.mcss';

import { connect }  from 'react-redux';

const JobMonitor = React.createClass({
  displayName: 'JobMonitor',

  propTypes: {
    taskflowId: React.PropTypes.string,
    tasks: React.PropTypes.array,
    jobs: React.PropTypes.array,
    taskStatusCount: React.PropTypes.object,
    taskflowLog: React.PropTypes.array,
  },

  getInitialState() {
    return {
      advanced: false,
    };
  },


  // refreshTaskflowLog() {
  //   TaskflowManager.getTaskflowLog(this.props.taskFlowId)
  //     .then(resp => {
  //       this.setState({ taskflowLog: resp.data.log });
  //     });
  // },

  toggleAdvanced() {
    const advanced = !this.state.advanced;
    this.setState({ advanced });
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
                  ></i>
              </div>
          </div>
          <div className={ style.jobContent }>
            {
              this.props.jobs.map(job =>
                <ExecutionUnit key={job._id} unit={job} />
              )
            }
          </div>
          <div className={ this.state.advanced ? style.taskflowContainer : style.hidden }>
              <div className={ style.toolbar }>
                  <div className={ style.title }>
                      Workflow tasks
                  </div>
                  <div className={ style.buttons }>
                  </div>
              </div>
              <div className={ style.taskflowContent }>
                {
                  this.props.tasks.map(task =>
                    <ExecutionUnit key={task._id} unit={task} />
                  )
                }
              </div>
              <div className={ style.toolbar }>
                  <div className={ style.title }>
                      Workflow log
                  </div>
                  <div className={ style.buttons }></div>
              </div>
              <div className={ style.taskflowContent }>
                {
                  <ExecutionUnit key={this.props.taskflowId} unit={{ name: 'Log', log: this.props.taskflowLog }} />
                }
              </div>
          </div>
      </div>);
  },
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  (state, props) => {
    const taskflowId = props.taskflowId;
    const taskflow = taskflowId ? state.taskflows.mapById[taskflowId] : null;
    const tasks = [];
    const jobs = [];
    const taskStatusCount = {};
    var taskflowLog = [];

    if (taskflow) {
      Object.keys(taskflow.taskMapById).forEach(id => {
        tasks.push(taskflow.taskMapById[id]);
        const status = taskflow.taskMapById[id].status;
        if (taskStatusCount[status]) {
          taskStatusCount[status]++;
        } else {
          taskStatusCount[status] = 1;
        }
      });
      Object.keys(taskflow.jobMapById).forEach(id => {
        jobs.push(taskflow.jobMapById[id]);
      });
      // console.log(taskflow.log);
      taskflowLog = taskflow.log;
    }

    // Sort the tasks by created timestamp
    tasks.sort((task1, task2) => Date.parse(task1.created) > Date.parse(task2.created));

    // FIXME need to fill taskflowLog

    return {
      tasks,
      jobs,
      taskStatusCount,
      taskflowLog,
    };
  }
)(JobMonitor);

