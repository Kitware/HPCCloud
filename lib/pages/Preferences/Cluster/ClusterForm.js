import React from 'react';
import style from '../../Generic/New/GenericNew.mcss';

export default React.createClass({

    displayName: 'ClusterForm',

    propTypes: {
        data: React.PropTypes.object,
        itemChange: React.PropTypes.func,
    },

    formChange(event) {
        if (this.props.itemChange) {
            const key = event.target.dataset.key,
                newData = this.props.data;

            newData[key] = event.target.value;
            this.props.itemChange(newData);
        }
    },

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
                        <input className={style.form} type="text" value={this.props.data.hostname}
                            data-key="hostname" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Username</label>
                        <input className={style.form} type="text" value={this.props.data.username}
                            data-key="username" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Number of Slots</label>
                        <input className={style.form} type="text" value={this.props.data.slots}
                            data-key="slots" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Parallel Environment</label>
                        <input className={style.form} type="text" value={this.props.data.parallelEnv}
                            data-key="parallelEnv" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Paraview Directory</label>
                        <input className={style.form} type="text" value={this.props.data.paraviewDir}
                            data-key="paraviewDir" onChange={this.formChange} required />
                    </section>
                </form>
            </div>);
    },
});

