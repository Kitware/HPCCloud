import React                   from 'react';
import defaultServerParameters from '../../../../../../panels/run/defaults'
import RunEC2                  from '../../../../../../panels/run/RunEC2';
import RunCluster              from '../../../../../../panels/run/RunCluster';
import RunOpenStack            from '../../../../../../panels/run/RunOpenStack';
import ButtonBar               from '../../../../../../panels/ButtonBar';
import client                  from '../../../../../../network';
import formStyle               from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({
    displayName: 'pvw/start-visualization',
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
    getInitialState() {
        return {serverType: 'EC2',
            EC2: defaultServerParameters.EC2,
            Traditional:defaultServerParameters.Traditional,
            OpenStack: defaultServerParameters.OpenStack,
            error: '',
        };
    },
    componentWillMount() {

    },
    dataChange(key, value, server) {
        var profile = this.state[server];
        profile[key] = value;
        this.setState({[server]: profile});
    },
    startVisualization() {
        client.createTaskflow(this.props.taskFlowName)
            .then( (resp) => {
                return client.startTaskflow(resp.data._id);
            })
            .then( (resp) => {
                console.log('simulation started');
                // this.context.router.replace();
            })
            .catch( (error) => {
                this.setState({error: error.data.message});
            });
    },
    formAction(action) {
        this[action]();
    },
    render() {
        var actions = [{name: 'startVisualization', label:'Start Visualization', icon:''}],
            element;
            switch(this.state.serverType) {
                case 'EC2':
                    element = <RunEC2 contents={this.state.EC2} onChange={this.dataChange} />;
                    break;
                case 'Traditional':
                    element = <RunCluster contents={this.state.Traditional} onChange={this.dataChange} />;
                    break;
                case 'OpenStack':
                    element = <RunOpenStack />;
                    break;
                default:
                    element = <span>no valid serverType: {this.state.serverType}</span>;
            }
        return (
            <div>
                <section className={formStyle.group}>
                    <label className={formStyle.label}>Region</label>
                    <select className={formStyle.input} value={this.state.serverType} onChange={ (e) => this.setState({serverType: e.target.value})}>
                        <option value="EC2">EC2</option>
                        <option value="Traditional">Traditional</option>
                        <option value="OpenStack">OpenStack</option>
                    </select>
                </section>
                <section>
                    {element}
                </section>
                <section>
                    <ButtonBar
                        visible={this.state[this.state.serverType].profile !== ''}
                        onAction={this.formAction}
                        actions={actions}
                        error={this.state.error} />
                </section>
            </div>
        );
    },
});
