import CollapsibleWidget    from 'paraviewweb/src/React/Widgets/CollapsibleWidget'
import React                from 'react';
import TaskflowManager      from '../../network/TaskflowManager';
import { formatTime }       from '../../utils/Format';

import style                from 'HPCCloudStyle/JobMonitor.mcss';


export default React.createClass({
    displayName: 'JobMonitor',

    propTypes: {
        taskFlowId: React.PropTypes.string,
    },

    getInitialState() {
        return {
            tasks: [], //taskflow tasks
            jobs:  [], //hpc tasks/job
            advanced: false,
        };
    },

    componentWillMount(){
        this.subscription = TaskflowManager.monitorTaskflow(this.props.taskFlowId, (pkt) => {
            this.setState(pkt);
        });
    },

    componentWillUnmount() {
        if(this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    },

    toggleAdvanced() {
        const advanced = !this.state.advanced;
        this.setState({advanced});
    },

    render() {
        return (
            <div className={ style.container }>
                <div className={ style.toolbar }>
                    <div className={ style.title }>
                        Jobs
                    </div>
                    <div className={ style.buttons }>
                        <i className={ this.state.advanced ? style.advancedIconOn : style.advancedIconOff}
                            onClick={ this.toggleAdvanced }>
                        </i>
                    </div>
                </div>
                <div className={ style.jobContent }>
                    {this.state.jobs.map( (job) =>
                        <section key={job._id} className={ style.listItem }>
                            <strong className={ style.itemContent }>{job.name}</strong>
                            <div    className={ style.itemContent }>{job.status}</div>
                        </section>
                    )}
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
                        { this.state.tasks.map( (task) => {
                            if (task.log.length === 0) {
                                return (
                                    <section key={task._id} className={ style.listItem }>
                                        <strong className={ style.itemContent }>{task.name.split('.').pop()}</strong>
                                        <div    className={ style.itemContent }>{task.status}</div>
                                    </section>);
                            }
                            return (
                                <section key={task._id} className={ style.logListItem }>
                                    <CollapsibleWidget title={task.name.split('.').pop()}
                                        subtitle={task.status}
                                        open={false}>
                                        <pre className={ style.log }>
                                            {   //reduce log array to a string with formatted entries
                                                task.log.reduce( (prevVal, entry, index) => {
                                                    prevVal += `[${formatTime(entry.created)}] ${entry.levelname}: ${entry.msg}\n`

                                                    if (entry.exc_info) {
                                                        prevVal += entry.exc_info.join('\n');
                                                    }

                                                    return prevVal;
                                                }
                                                , '')

                                            }
                                        </pre>
                                    </CollapsibleWidget>
                                </section>);
                        })}
                    </div>
                </div>
            </div>);
    },
});
