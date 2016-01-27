import React from 'react';
import style from '../../Generic/New/GenericNew.mcss';

export default React.createClass({

    displayName: 'ClusterForm',

    propTypes: {
        data: React.PropTypes.object,
        itemChange: React.PropTypes.func,
    },

    getInitialState() {
        return {
            regions: {
                'us-east-1': ['a','b','c','d','e'],
                'us-west-1': ['a','b','c'],
                'us-west-2': ['a','b','c'],
                'eu-west-1': ['a','b','c'],
                'eu-central-1': ['a','b'],
                'ap-southeast-1': ['a','b'],
                'ap-southeast-2': ['a','b'],
                'ap-northeast-1': ['a','b','c'],
                'sa-east-1': ['a','b'],
            },
        }
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
                        <label className={style.label}>Key Id</label>
                        <input className={style.form} type="text" value={this.props.data.idKey}
                            data-key="idKey" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Secret Id</label>
                        <input className={style.form} type="password" value={this.props.data.secretKey}
                            data-key="secretKey" onChange={this.formChange} required/>
                        </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Region</label>
                        <select className={style.form} value={this.props.data.region}
                            data-key="region" onChange={this.formChange} required >
                            { Object.keys(this.state.regions).map( (reg, index) => {
                                return (<option key={reg+ '_' + index} value={reg}>{reg}</option>);
                            }) }
                        </select>
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Availability Zone</label>
                        <select className={style.form} value={this.props.data.availabilityZone}
                            data-key="availabilityZone" onChange={this.formChange} required>
                            { this.state.regions[this.props.data.region].map( (zone, index) => {
                                return (<option key={zone + '_' + index} value={zone}>{zone}</option>);
                            }) }
                        </select>
                    </section>
                </form>
            </div>);
    },
});