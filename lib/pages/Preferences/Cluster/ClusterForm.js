import React from 'react';
import style from '../../Generic/New/GenericNew.mcss';

export default React.createClass({

    displayName: 'ClusterForm',

    propTypes: {
        data: React.PropTypes.object,
        itemChange: React.PropTypes.func,
    },

    formChange(event) {
        var keyPath = event.target.dataset.key.split('.'),
            currentContainer;
        if (this.props.itemChange) {
            const lastKey = keyPath.pop(),
                valueToSave = event.target.value,
                rootData = this.props.data;

            currentContainer = rootData;
            while(keyPath.length) {
                currentContainer = currentContainer[keyPath.shift()];
            }

            currentContainer[lastKey] = valueToSave;
            this.props.itemChange(rootData);
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
                        <input className={style.form} type="text" value={this.props.data.name}
                            data-key="name" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Hostname</label>
                        <input className={style.form} type="text" value={this.props.data.config.host}
                            data-key="config.host" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Username</label>
                        <input className={style.form} type="text" value={this.props.data.config.ssh.user}
                            data-key="config.ssh.user" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Output Directory</label>
                        <input className={style.form} type="text" value={this.props.data.config.jobOutputDir}
                            data-key="config.jobOutputDir" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Number of Slots</label>
                        <input className={style.form} type="text" value={this.props.data.config.numberOfSlots}
                            data-key="config.numberOfSlots" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Parallel Environment</label>
                        <input className={style.form} type="text" value={this.props.data.config.parallelEnvironment}
                            data-key="config.parallelEnvironment" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Paraview Directory</label>
                        <input className={style.form} type="text" value={this.props.data.config.paraview.installDir}
                            data-key="config.paraview.installDir" onChange={this.formChange} required />
                    </section>
                </form>
            </div>);
    },
});

