import React        from 'react';
import ButtonBar    from '../../../../../../panels/ButtonBar';

export default React.createClass({
    displayName: 'pvw/view-visualization',
    propTypes: {
        project: React.PropTypes.object,
        simulation: React.PropTypes.object,
        step: React.PropTypes.string,
        taskFlowName: React.PropTypes.string,
        view: React.PropTypes.string,
    },
    contextTypes: {
        router: React.PropTypes.object,
    },
    componentWillMount(){
        // get jobs for taskflowid
        //
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
                    visible={this.state[this.state.serverType].profile !== ''}
                    onAction={ (action) => { this[action](); }}
                    actions={actions}
                    error={this.state.error} />
                </section>
            </div>
        );
    },
});
