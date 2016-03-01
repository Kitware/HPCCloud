import ButtonBar    from '../../../../../../panels/ButtonBar';
import client       from '../../../../../../network';
import JobMonitor   from '../../../../../../panels/JobMonitor'
import merge        from 'mout/src/object/merge';
import React        from 'react';
import tfManager    from '../../../../../../network/TaskflowManager';

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
            taskflowId: '',
            error: '',
        };
    },

    componentWillMount(){
        const taskflowId = this.props.simulation.steps[this.props.simulation.active].metadata.taskflowId;
        this.setState({taskflowId});
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
        ];

        return (
            <div>
                <JobMonitor taskFlowId={ this.state.taskflowId }/>
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
