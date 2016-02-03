import React        from 'react';
import RunEC2       from '../../../../../panels/run/RunEC2';
import RunCluster   from '../../../../../panels/run/RunCluster';
import RunOpenStack from '../../../../../panels/run/RunOpenStack';

import style from 'HPCCloudStyle/ItemEditor.mcss';

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

        return ( <div className={style.container}>
            <section className={style.group}>
                <label className={style.label}>Server type:</label>
                <select className={style.input} onChange={this.typeChange}
                    value={this.state.type}
                    defaultValue={this.state.types[0]}>
                    {this.state.types.map(optionMapper)}
                </select>
            </section>
            <form>
                {typeContainer()}

                <section className={style.buttonGroup}>
                    <button className={style.button} onClick={this.runSimulation}>Run Simulation</button>
                </section>
            </form>
        </div>);
    },
});
