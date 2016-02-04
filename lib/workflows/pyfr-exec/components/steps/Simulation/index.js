import React        from 'react';
import RunEC2       from '../../../../../panels/run/RunEC2';
import RunCluster   from '../../../../../panels/run/RunCluster';
import RunOpenStack from '../../../../../panels/run/RunOpenStack';

import client       from '../../../../../network';

import style        from 'HPCCloudStyle/ItemEditor.mcss';

const CURRENT_STEP = 'Simulation';
const NEXT_STEP = 'Visualization';

export default React.createClass({

    displayName: 'PyFrRunSim',

    propTypes: {
        project: React.PropTypes.object,
        simulation: React.PropTypes.object,
        step: React.PropTypes.string,
        view: React.PropTypes.string,
    },

    contextTypes: {
        router: React.PropTypes.object,
    },

    getInitialState() {
        return {
            type: 'Traditional',
            types: ['EC2', 'Traditional'],
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
        client.updateActiveStep(this.props.simulation, NEXT_STEP, CURRENT_STEP)
            .then(resp => {
                this.context.router.replace(['/View/Simulation', this.props.simulation._id, NEXT_STEP].join('/'))
            })
            .catch(err => {
                console.log('Error: PyFrSym/run', err);
            });
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
