import React        from 'react';
import client       from '../../../../../../network';
import ButtonBar    from '../../../../../../panels/ButtonBar';
import formStyle    from 'HPCCloudStyle/ItemEditor.mcss';
import layout       from 'HPCCloudStyle/Layout.mcss';
import theme        from 'HPCCloudStyle/Theme.mcss';

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
        client.getTaskflowTaskStatuses(this.props.location.query.taskflowId)
            .then((resp) => {
                this.setState({tasks: resp.data});
            })
            .catch((error) => {
                this.setState({error: error.data.message});
            });
        client.onEvent((resp) => {
            const tasks = this.state.tasks;
            for (let i=0; i < tasks.length; i++) {
                if (tasks[i]._id === resp.data._id) {
                    tasks[i].status = resp.data.status;
                    this.setState({tasks});
                    return;
                }
            }
            console.log(`no task found with id: ${resp.data._id}`);
        });
    },
    visualizeTaskflow() {
        console.log('visualize');
    },
    logTaskflow() {
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
            {name: 'logTaskflow',       label:'Log',       icon:''},
            {name: 'terminateTaskflow', label:'Terminate', icon:''},
        ];
        return (
            <div>
                { this.state.tasks.map( (task) =>
                    <section key={task._id} className={theme.statusListItem}>
                        <div className={layout.horizontalFlexContainer}>
                            <label className={formStyle.label}>Name:</label>
                            <span className={layout.flexItem}>{task.name.split('.').pop()}</span>
                        </div>
                        <div className={layout.horizontalFlexContainer}>
                            <label className={formStyle.label}>Status:</label>
                            <span className={layout.flexItem}>{task.status}</span>
                        </div>
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
