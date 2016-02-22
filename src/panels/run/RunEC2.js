import client   from '../../network';
import machines from './machines';
import React    from 'react';
import { Link } from 'react-router';

import theme    from 'HPCCloudStyle/Theme.mcss';
import style    from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({
    displayName: 'run/cluster',

    propTypes: {
        contents: React.PropTypes.object,
        onChange: React.PropTypes.func,
    },

    getInitialState() {
        return {
            busy: false,
            profiles: [],
            profile: {},
        };
    },

    componentWillMount() {
        this.updateState();
    },

    updateState() {
        this.setState({busy:true});
        client.listAWSProfiles()
            .then(resp => this.setState({profiles: resp.data, busy: false}))
            .catch(err => {
                console.log('Error: Sim/RunEC2', err);
                this.setState({busy:false});
            });
    },

    dataChange(event) {
        if (this.props.onChange) {
            this.props.onChange(event.target.dataset.key, event.target.value, 'EC2');
        }
    },

    render() {
        var optionMapper = (el, index) => {
            return (<option key={el.name + '_' + index}
                value={el.name}>
                    {el.name}
                </option>);
            },
            machineMapper = (machine, index) => {
            return (<option key={machine.name + '_' + index}
                value={machine.name}>
                    { machine.name } -
                    { machine.cpu } cores -
                    { machine.memory } GB { machine.gpu ? " + GPU" : "" } -
                    { machine.storage }
                </option>);
            };

        if(this.state.profiles.length === 0) {
            return this.state.busy ? null :
                    <div className={style.container + ' ' + theme.warningBox} style={{margin: '15px'}}>
                        <span>
                            There are no EC2 AWS profiles defined. Add some on&nbsp;
                            <Link to='/Preferences/AWS'>the AWS preference page</Link>.
                        </span>
                    </div>;
        }

        return (
            <div className={style.container}>
                <section className={style.group}>
                    <label className={style.label}>Profile:</label>
                    <select onChange={this.dataChange} className={style.input}
                        data-key="profile"
                        value={this.props.contents.profle}
                        defaultValue={this.state.profiles[0].name}>
                        {this.state.profiles.map(optionMapper)}
                    </select>
                </section>
                <section className={style.group}>
                    <label className={style.label}>Machine:</label>
                    <select onChange={this.dataChange} className={style.input}
                        data-key="machine"
                        value={this.props.contents.machine}
                        defaultValue={machines[0]}>
                        {machines.map(machineMapper)}
                    </select>
                </section>
                <section className={style.group}>
                    <label className={style.label}>Cluster size:</label>
                    <input type="number" min="1" max="100" className={style.input}
                        data-key="clusterSize"
                        value={this.props.contents.clusterSize}
                        onChange={this.dataChange} required/>
                </section>
                <section className={style.group}>
                    <label className={style.label}>Volumne size:</label>
                    <input type="number" min="1" max="16384" className={style.input}
                        data-key="volumneSize"
                        value={this.props.contents.volumneSize}
                        onChange={this.dataChange} required/>
                </section>
            </div>
        );
    },
});
