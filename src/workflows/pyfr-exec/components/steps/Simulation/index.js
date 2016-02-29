import React                   from 'react';
import defaultServerParameters from '../../../../../panels/run/defaults'
import RunEC2                  from '../../../../../panels/run/RunEC2';
import RunCluster              from '../../../../../panels/run/RunCluster';
import RunOpenStack            from '../../../../../panels/run/RunOpenStack';
import ButtonBar               from '../../../../../panels/ButtonBar';

import client                  from '../../../../../network';
import unique                  from 'mout/src/array/unique';

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
        var disabled = unique([ CURRENT_STEP ].concat(this.props.simulation.disabled));
        disabled = disabled.filter(i => (i !== undefined && i !== null && i !== NEXT_STEP));

        console.log('run this Simulation with:', this.state[this.state.serverType]);

        client.activateSimulationStep(this.props.simulation, NEXT_STEP, disabled)
            .then(r => {
                this.context.router.replace(['/View/Simulation', this.props.simulation._id, NEXT_STEP].join('/'));
            })
            .catch(err => {
                console.log('Error: PyFrSym/run/path', err);
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
