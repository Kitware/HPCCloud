import React                from 'react';
import TaskflowManager      from '../../network/TaskflowManager';
import ExecutionUnit        from './ExecutionUnit.js';
import style                from 'HPCCloudStyle/JobMonitor.mcss';

export default React.createClass({
  displayName: 'JobMonitor',

  propTypes: {
    taskFlowId: React.PropTypes.string,
  },

  getInitialState() {
    return {
      taskflowLog: [],
      taskStatusCount: {},
      tasks: [], // taskflow tasks
      jobs: [], // hpc tasks/job
      advanced: false,
    };
  },

  componentWillMount() {
    this.refreshTaskflowLog();
    this.subscription = TaskflowManager.monitorTaskflow(this.props.taskFlowId, (pkt) => {
      // Sort the tasks by created timestamp
      pkt.tasks.sort((task1, task2) => Date.parse(task1.created) > Date.parse(task2.created));
      this.setState(pkt);
    });
  },

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  },

  refreshTaskflowLog() {
    TaskflowManager.getTaskflowLog(this.props.taskFlowId)
      .then(resp => {
        this.setState({ taskflowLog: resp.data.log });
      });
  },

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
                  { Object.keys(this.state.taskStatusCount).map(status =>
                    <span key={status} className={ style.count }>{ `${status}(${this.state.taskStatusCount[status]})` }</span>
                  )}
                  <i
                    className={ this.state.advanced ? style.advancedIconOn : style.advancedIconOff}
                    onClick={ this.toggleAdvanced }
                  ></i>
              </div>
          </div>
          <div className={ style.jobContent }>
            {
              this.state.jobs.map(job =>
                <ExecutionUnit key={job._id} unit={job} />
              )
            }
          </div>
          <div className={ this.state.advanced ? style.taskflowContainer : style.hidden }>
              <div className={ style.toolbar }>
                  <div className={ style.title }>
                      Taskflow tasks
                  </div>
                  <div className={ style.buttons }>
                  </div>
              </div>
              <div className={ style.taskflowContent }>
                {
                  this.state.tasks.map(task =>
                    <ExecutionUnit key={task._id} unit={task} />
                  )
                }
              </div>
              <div className={ style.toolbar }>
                  <div className={ style.title }>
                      Taskflow log
                  </div>
                  <div className={ style.buttons }>
                    <i className={style.refreshIcon} onClick={this.refreshTaskflowLog}></i>
                  </div>
              </div>
              <div className={ style.taskflowContent }>
                {
                  <ExecutionUnit key={this.props.taskFlowId} unit={{ name: 'Log', log: this.state.taskflowLog }} />
                }
              </div>
          </div>
      </div>);
  },
});
