import React from 'react';
import form from 'HPCCloudStyle/form.css';
import layout from 'HPCCloudStyle/layout.css';
import theme from 'HPCCloudStyle/theme.mcss';
// import client from '../../../network';

import RunEC2 from '../../../pages/Generic/Simulation/RunEC2';
import RunCluster from '../../../pages/Generic/Simulation/RunCluster';
import RunOpenStack from '../../../pages/Generic/Simulation/RunOpenStack';

export default React.createClass({

    displayName: 'PyFrRunSim',

    getInitialState() {
        return {
            type: 'EC2',
            types: ['EC2', 'Traditional', 'OpenStack'],
            EC2: {
                profile: '',
                machine: '',
                clusterSize: '',
                volumneSize: '',
            },
            Traditional: {
                cluster: '',
                maxRuntime: '',
            },
        };
    },

    dataChange(key, value, which) {
        var profile = this.state[which];
        profile[key] = value;
        this.setState({[which]: profile});
    },

    typeChange(event) {
        this.setState({type: event.target.value});
    },

    runSimulation(event) {
        console.log('run this Simulation with:', this.state[this.state.type]);
    },

    render() {
        var optionMapper = (el, index) => {
            return (<option key={el + '_' + index}
                value={el}>
                    {el}
                </option>);
            },
            typeContainer = () => {
                switch(this.state.type) {
                    case 'EC2':
                        return <RunEC2 contents={this.state.EC2} onChange={this.dataChange} />;
                    case 'Traditional':
                        return <RunCluster contents={this.state.Traditional} onChange={this.dataChange} />
                    case 'OpenStack':
                        return <RunOpenStack />
                }
            };

        return ( <div className={layout.verticalFlexContainer}>
            <section className={form.group}>
                <label className={form.label}>Server type:</label>
                <select className={form.input} onChange={this.typeChange}
                    value={this.state.type}
                    defaultValue={this.state.types[0]}>
                    {this.state.types.map(optionMapper)}
                </select>
            </section>
            <form>
                {typeContainer()}

                <section className={form.buttonGroup}>
                    <button className={theme.btn} onClick={this.runSimulation}>Run Simulation</button>
                </section>
            </form>
        </div>);
    },
});
