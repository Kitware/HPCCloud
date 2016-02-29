import * as tfManager from '../../../../../../network/TaskflowManager';
import ButtonBar    from '../../../../../../panels/ButtonBar';
import client       from '../../../../../../network';
import CollapsibleWidget from 'paraviewweb/src/React/Widgets/CollapsibleWidget'
import layout       from 'HPCCloudStyle/Layout.mcss';
import merge        from 'mout/src/object/merge';
import React        from 'react';
import statusList   from 'HPCCloudStyle/StatusList.mcss';

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
            error: '',
        };
    },
    componentWillMount(){
        var tfid = this.props.simulation.steps[this.props.simulation.active].metadata.taskflowId,
            newStateFromPacket = (pkt) => {
                this.setState(pkt);
            };

        tfManager.setTaskflow(tfid);
        tfManager.changeDispatcher.on(`${tfid}`, newStateFromPacket);
    },
    visualizeTaskflow() {
        this.context.router.replace({
            pathname: this.props.location.pathname,
            query: merge(this.props.location.query, {view: 'visualizer'}),
            state: this.props.location.state,
        });
    },
    terminateTaskflow() {
        tfManager.terminateTaskflow(this.props.simulation.steps[this.props.simulation.active].metadata.taskflowId);
    },
    deleteTaskflow() {
        tfManager.deleteTaskflow(this.props.simulation.steps[this.props.simulation.active].metadata.taskflowId)
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
                <h3 className={statusList.header}>Jobs</h3>
                {this.state.jobs.map( (job) =>
                    <section key={job._id} className={statusList.statusListItem}>
                        <strong className={statusList.statusListItemContent}>{job.name}</strong>
                        <div    className={statusList.statusListItemContent}>{job.status}</div>
                    </section>
                )}
                <h3 className={statusList.header}>Taskflow tasks</h3>
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
