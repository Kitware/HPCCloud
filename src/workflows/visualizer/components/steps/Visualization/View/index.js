import React        from 'react';
import client       from '../../../../../../network';
import ButtonBar    from '../../../../../../panels/ButtonBar';

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
    },
    visualizeTaskflow() {
        console.log('visualize');
    },
    logTaskflow() {
        console.log('log');
    },
    terminateTaskflow() {
        if(confirm('Are you sure you want to terminate this job?')) {
            return;
        }
        console.log('terminate');
    },
    render() {
        var actions = [
            {name: 'visualizeTaskflow', label:'Visualize', icon:''},
            {name: 'logTaskflow',       label:'Log',       icon:''},
            {name: 'terminateTaskflow', label:'Terminate', icon:''},
        ];
        return (
            <div>
                {/* foreach jobs <jobInfoContainer /> */}
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
