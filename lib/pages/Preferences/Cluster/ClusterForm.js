import deepEquals   from 'mout/src/lang/deepEquals';
import React        from 'react';
import style        from '../../Generic/New/GenericNew.mcss';

export default React.createClass({

    displayName: 'ClusterForm',

    propTypes: {
        data: React.PropTypes.object,
        itemChange: React.PropTypes.func,
    },

    getInitialState() {
        return {
            data: this.props.data,
        };
    },

    componentWillReceiveProps(nextProps) {
        const data = nextProps.data,
            oldData = this.props.data;

        if(!deepEquals(data, oldData)) {
            this.setState({data});
        }
    },

    formChange(event) {
        var keyPath = event.target.dataset.key.split('.'),
            currentContainer;
        if (this.props.itemChange) {
            const lastKey = keyPath.pop(),
                valueToSave = event.target.value,
                data = this.state.data;

            currentContainer = data;
            while(keyPath.length) {
                currentContainer = currentContainer[keyPath.shift()];
            }

            currentContainer[lastKey] = valueToSave;
            this.setState({data});
            this.props.itemChange(data);
        }
    },

    // {
    //     name: 'new cluster',
    //     type: 'trad',
    //     config: {
    //         host: 'localhost',
    //         ssh: {
    //             user: 'Your_Login',
    //         },
    //         parallelEnvironment: '',
    //         numberOfSlots: 1,
    //         jobOutputDir: '/tmp',
    //         paraview: {
    //             installDir: '/opt/paraview',
    //         },
    //     },
    // },

    render() {
        return (
            <div>
                <form onSubmit={(e) => {e.preventDefault()} }>
                    <section className={style.formItem}>
                        <label className={style.label}>Name</label>
                        <input className={style.form} type="text" value={this.state.data.name}
                            data-key="name" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Hostname</label>
                        <input className={style.form} type="text" value={this.state.data.config.host}
                            data-key="config.host" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Username</label>
                        <input className={style.form} type="text" value={this.state.data.config.ssh.user}
                            data-key="config.ssh.user" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Output Directory</label>
                        <input className={style.form} type="text" value={this.state.data.config.jobOutputDir}
                            data-key="config.jobOutputDir" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Number of Slots</label>
                        <input className={style.form} type="text" value={this.state.data.config.numberOfSlots}
                            data-key="config.numberOfSlots" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Parallel Environment</label>
                        <input className={style.form} type="text" value={this.state.data.config.parallelEnvironment}
                            data-key="config.parallelEnvironment" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Scheduler</label>
                        <select className={style.form} value={this.state.data.config.scheduler.type}
                            data-key="config.scheduler.type" onChange={this.formChange} required>
                            <option value='sge'>Sun Grid Engine</option>
                            <option value='pbs'>PBS</option>
                            <option value='slurm'>SLURM</option>
                        </select>
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Paraview Directory</label>
                        <input className={style.form} type="text" value={this.state.data.config.paraview.installDir}
                            data-key="config.paraview.installDir" onChange={this.formChange} required />
                    </section>
                </form>
            </div>);
    },
});

