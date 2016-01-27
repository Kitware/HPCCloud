import React from 'react';
import style from '../New/GenericNew.mcss';
import client from '../../../network';
import machines from './machines';

export default React.createClass({
    displayName: 'run/cluster',

    propTypes: {
        contents: React.PropTypes.object,
        onChange: React.PropTypes.func,
    },

    getInitialState() {
        return {
            profiles: [],
            profile: this.props.contents,
        };
    },

    componentWillMount() {
        this.updateState();
    },

    updateState() {
        client.getAWSProfiles((profiles) => {
            this.setState({profiles});
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
                    { machine.name } - { machine.cpu } cores - { machine.memory } GB { machine.gpu ? " + GPU" : "" } - { machine.storage }
                </option>);
            };

        return (
            <div className={style.subcontainer}>
                <section className={style.formItem}>
                    <div className={style.label}>Profile:</div>
                    <div className={style.form}>
                        <select onChange={this.dataChange}
                            data-key="profile"
                            value={this.props.contents.profle}
                            defaultValue={this.state.profiles[0].name}>
                            {this.state.profiles.map(optionMapper)}
                        </select>
                    </div>
                </section>
                <section className={style.formItem}>
                    <div className={style.label}>Machine:</div>
                    <div className={style.form}>
                        <select onChange={this.dataChange}
                            data-key="machine"
                            value={this.props.contents.machine}
                            defaultValue={machines[0]}>
                            {machines.map(machineMapper)}
                        </select>
                    </div>
                </section>
                <section className={style.formItem}>
                    <div className={style.label}>Cluster size:</div>
                    <div className={style.form}>
                        <input type="number" min="1" max="100"
                            data-key="clusterSize"
                            value={this.props.contents.clusterSize}
                            onChange={this.dataChange} required/>
                    </div>
                </section>
                <section className={style.formItem}>
                    <div className={style.label}>Volumne size:</div>
                    <div className={style.form}>
                        <input type="number" min="1" max="16384"
                            data-key="volumneSize"
                            value={this.props.contents.volumneSize}
                            onChange={this.dataChange} required/>
                    </div>
                </section>
            </div>
        );
    },
});