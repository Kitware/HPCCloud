import React        from 'react';
import client       from '../../../../../../network';
import ButtonBar    from '../../../../../../panels/ButtonBar';
import CollapsibleWidget from 'paraviewweb/src/React/Widgets/CollapsibleWidget'
import layout       from 'HPCCloudStyle/Layout.mcss';
import statusList        from 'HPCCloudStyle/StatusList.mcss';

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
            tasks: [],
            error: '',
        }
    },
    componentWillMount(){
        this.fetchTaskflowTasks();

        client.onEvent((resp) => {
            const tasks = this.state.tasks;
            if (resp.data.status === 'complete') {
                this.fetchTaskflowTasks();
            }
            for (let i=0; i < tasks.length; i++) {
                if (tasks[i]._id === resp.data._id) {
                    tasks[i].status = resp.data.status;
                    this.setState({tasks});
                    return;
                }
            }
            console.log(`no task found with id: ${resp.data._id}`, resp.data);
        });
    },
    fetchTaskflowTasks() {
        client.getTaskflowTaskStatuses(this.props.location.query.taskflowId)
            .then((resp) => {
                this.setState({tasks: resp.data});
            })
            .catch((error) => {
                this.setState({error: error.data.message});
            });
    },
    visualizeTaskflow() {
        console.log('visualize');
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
                { this.state.tasks.map( (task) => {
                    if (task.log.length === 0) {
                        return (<section key={task._id} className={statusList.statusListItem}>
                            <strong className={statusList.statusListItemContent}>{task.name.split('.').pop()}</strong>
                            <div className={statusList.statusListItemContent}>{task.status}</div>
                        </section>);
                    }
                    return <section key={task._id} className={statusList.statusListLogItem}>
                        <div className={layout.horizontalFlexContainer}>
                            <CollapsibleWidget title={task.name.split('.').pop()}
                                subtitle={task.status}
                                open={false}>
                                <pre>
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
