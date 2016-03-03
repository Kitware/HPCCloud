import React                   from 'react';

import defaultServerParameters from '../../../../../../panels/run/defaults'
import RunEC2                  from '../../../../../../panels/run/RunEC2';
import RunCluster              from '../../../../../../panels/run/RunCluster';
import RunOpenStack            from '../../../../../../panels/run/RunOpenStack';
import ButtonBar               from '../../../../../../panels/ButtonBar';

import client                  from '../../../../../../network';
import deepClone               from 'mout/src/lang/deepClone';
import merge                   from 'mout/src/object/merge';
import formStyle               from 'HPCCloudStyle/ItemEditor.mcss';

const CURRENT_STEP = 'Simulation';
const NEXT_STEP = 'Visualization';

export default React.createClass({

    displayName: 'PyFrRunSim',

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
            serverType: 'Traditional',
            EC2: defaultServerParameters.EC2,
            Traditional:defaultServerParameters.Traditional,
            OpenStack: defaultServerParameters.OpenStack,
            error: '',
        };
    },
    dataChange(key, value, which) {
        var profile = this.state[which];
        profile[key] = value;
        this.setState({[which]: profile});
    },
    runSimulation(event) {
        var taskflowId,
            sessionId = btoa(new Float64Array(3).map(Math.random)).substring(0,96);

        client.createTaskflow(this.props.taskFlowName)
            .then((resp) => {
                taskflowId = resp.data._id;
                return client.startTaskflow(taskflowId, {
                    input: {
                       folder: {
                           id: this.props.simulation.metadata.inputFolder._id,
                       },
                       meshFile: {
                           id: this.props.simulation.metadata.inputFolder.files.mesh,
                       },
                    },
                    output: {
                        folder : {
                            id : this.props.simulation.metadata.outputFolder._id,
                       },
                    },
                    cluster: { _id:this.state[this.state.serverType].profile},
                });
            })
            .then((resp) => {
                return client.updateSimulationStep(this.props.simulation._id, this.props.step, {
                    view: 'run',
                    metadata: {taskflowId, sessionId},
                });
            })
            .then( (resp) => {
                var newSim = deepClone(this.props.simulation);
                newSim.steps[this.props.step].view = 'run';
                newSim.steps[this.props.step].metadata = {taskflowId, sessionId};
                client.invalidateSimulation(newSim);

                this.context.router.replace({
                    pathname: this.props.location.pathname,
                    query: merge(this.props.location.query, {view: 'run'}),
                    state: this.props.location.state,
                });
            })
            .catch( (error) => {
                this.setState({error: error.data.message});
            });
    },
    formAction(action) {
        this[action]();
    },
    render() {
        var actions = [{name: 'runSimulation', label:'Run Simulation', icon:''}],
            serverForm;
            switch(this.state.serverType) {
                case 'EC2':
                    serverForm = <RunEC2 contents={this.state.EC2} onChange={this.dataChange} />;
                    break;
                case 'Traditional':
                    serverForm = <RunCluster contents={this.state.Traditional} onChange={this.dataChange} />;
                    break;
                case 'OpenStack':
                    serverForm = <RunOpenStack />;
                    break;
                default:
                    serverForm = <span>no valid serverType: {this.state.serverType}</span>;
            }

        return <div>
                <section className={formStyle.group}>
                    <label className={formStyle.label}>Region</label>
                    <select className={formStyle.input} value={this.state.serverType} onChange={ (e) => this.setState({serverType: e.target.value})}>
                        <option value="Traditional">Traditional</option>
                        <option value="EC2">EC2</option>
                        <option value="OpenStack">OpenStack</option>
                    </select>
                </section>
                <section>
                    {serverForm}
                </section>
                <section className={formStyle.buttonGroup}>
                    <ButtonBar
                        visible={this.state[this.state.serverType].profile !== ''}
                        onAction={this.formAction}
                        actions={actions}
                        error={this.state.error} />
                </section>
            </div>;
    },
});
