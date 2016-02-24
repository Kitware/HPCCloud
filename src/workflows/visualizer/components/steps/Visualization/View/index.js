import React        from 'react';
import client       from '../../../../../../network';
import ButtonBar    from '../../../../../../panels/ButtonBar';
import CollapsibleWidget from 'paraviewweb/src/React/Widgets/CollapsibleWidget'
import layout       from 'HPCCloudStyle/Layout.mcss';
import statusList   from 'HPCCloudStyle/StatusList.mcss';
import merge        from 'mout/src/object/merge';

export default React.createClass({
    displayName: 'pvw/view-visualization',
    propTypes: {
        location: React.PropTypes.object,
        project: React.PropTypes.object,
        simulation: React.PropTypes.object,
        step: React.PropTypes.string,
        taskFlowName: React.PropTypes.string,
        view: React.PropTypes.string,
    },
    contextTypes: {
        router: React.PropTypes.object,
    },
    getInitialState() {
        return {
            tasks: [], //taskflow tasks
            jobs:  [], //hpc tasks/job
            debounceTimer: null,
            error: '',
        }
    },
    componentWillMount(){
        // this isn't very elegant, adjusting enpoints could help.
        // basically we can get events for jobs &tasks that we haven't fetched yet
        // so we fetch everytime we get an event :\
        client.onEvent((resp) =>{
            var notification = resp.data,
                tasks = [];

            client.getTaskflowTaskStatuses(this.props.location.query.taskflowId)
                .then((res) => {
                    tasks = res.data;
                    return client.getTaskflow(this.props.location.query.taskflowId);
                })
                .then((res) => {
                    let jobs = [],
                        update = false;
                    if (res.data.meta && res.data.meta.jobs) {
                        jobs = res.data.meta.jobs;
                    }

                    for (let i=0; !update && i < tasks.length; i++) {
                        if (tasks[i]._id === notification._id) {
                            tasks[i].status = notification.status;
                            update = true;
                        }
                    }
                    for (let i=0; !update && i < jobs.length; i++) {
                        if (jobs[i]._id === notification._id) {
                            jobs[i].status = notification.status;
                            update = true;
                        }
                    }

                    this.setState({tasks, jobs});
                })
                .catch((err) => {
                    console.log(err);
                });
        });

        this.fetchTaskflowTasks();
    },
    fetchTaskflowTasks() {
        var tasks;
        client.getTaskflowTaskStatuses(this.props.location.query.taskflowId)
            .then((resp) => {
                tasks = resp.data;
                return client.getTaskflow(this.props.location.query.taskflowId);
            })
            .then( (resp) => {
                var jobs = [];
                if (resp.data.meta && resp.data.meta.jobs) {
                    jobs = resp.data.meta.jobs;
                }
                this.setState({tasks, jobs});
            })
            .catch((error) => {
                console.log(error);
                this.setState({error: error.data.message});
            });
    },
    visualizeTaskflow() {
        this.context.router.replace({
            pathname: this.props.location.pathname,
            query: merge(this.props.location.query, {view: 'visualizer'}),
            state: this.props.location.state,
        });
    },
    logTaskflows() {
        console.log('log');
    },
    terminateTaskflow() {
        if(this.state.tasks.every(tk => tk.status !== 'error') &&
            !confirm('Are you sure you want to terminate this taskflow?')) {
            return;
        }
        client.deleteTaskflow(this.props.location.query.taskflowId)
            .then((resp) => {
                return client.updateSimulationStep(this.props.simulation._id, this.props.step, {
                    view: 'default',
                    metadata: {},
                });
            })
            .then((resp) => {
                this.context.router.replace({
                    pathname: this.props.location.pathname,
                    query:  {view: 'default'},
                    state: this.props.location.state,
                });
            })
            .catch((error) => {
                this.setState({error: error.data.message});
            });
    },
    render() {
        var actions = [
            {name: 'visualizeTaskflow', label:'Visualize', icon:''},
            {name: 'terminateTaskflow', label:'Terminate', icon:''},
        ],
        formatTime = (time) => {
            var date = new Date(time),
                hours = date.getHours().toString(),
                minutes = date.getMinutes().toString(),
                seconds = date.getSeconds().toString(),
                ms = date.getMilliseconds().toString();

            hours = hours.length === 1 ? '0' + hours : hours;
            minutes = minutes.length === 1 ? '0' + minutes : minutes;
            seconds = seconds.length === 1 ? '0' + seconds : seconds;
            if (ms.length < 3) {
                while(ms.length < 3) {
                    ms = '0' + ms;
                }
            }

            return hours + ':' + minutes + ':' + seconds + '.' + ms;
        };
        return (
            <div>
                <span className={statusList.header}>Taskflow tasks</span>
                { this.state.tasks.map( (task) => {
                    if (task.log.length === 0) {
                        return (<section key={task._id} className={statusList.statusListItem}>
                            <strong className={statusList.statusListItemContent}>{task.name.split('.').pop()}</strong>
                            <div    className={statusList.statusListItemContent}>{task.status}</div>
                        </section>);
                    }
                    return <section key={task._id} className={statusList.statusListLogItem}>
                        <div className={layout.horizontalFlexContainer}>
                            <CollapsibleWidget title={task.name.split('.').pop()}
                                subtitle={task.status}
                                open={false}>
                                <pre className={statusList.log}>
                                    {   //reduce log array to a string with formatted entries
                                        task.log.reduce( (prevVal, entry, index) =>
                                            prevVal + `[${formatTime(entry.created)}] ${entry.levelname}: ${entry.msg}\n`
                                        , '')
                                    }
                                </pre>
                            </CollapsibleWidget>
                        </div>
                    </section>;
                })}
                <span className={statusList.header}>Jobs</span>
                {this.state.jobs.map( (job) =>
                    <section key={job._id} className={statusList.statusListItem}>
                        <strong className={statusList.statusListItemContent}>{job.name}</strong>
                        <div    className={statusList.statusListItemContent}>{job.status}</div>
                    </section>
                )}
                <section>
                <ButtonBar
                    onAction={ (action) => { this[action](); }}
                    actions={actions}
                    error={this.state.error} />
                </section>
            </div>
        );
    },
});
