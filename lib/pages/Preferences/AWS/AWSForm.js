import deepEquals   from 'mout/src/lang/deepEquals';
import React        from 'react';
import style        from '../../Generic/New/GenericNew.mcss';

export default React.createClass({

    displayName: 'ClusterForm',

    propTypes: {
        data: React.PropTypes.object,
        onChange: React.PropTypes.func,
        regions: React.PropTypes.object,
    },

    getDefaultProps() {
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
        };
    },

    getInitialState() {
        return {
            data: this.props.data,
        }
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
        if (this.props.onChange) {
            const lastKey = keyPath.pop(),
                valueToSave = event.target.value,
                data = this.state.data;

            currentContainer = data;
            while(keyPath.length) {
                currentContainer = currentContainer[keyPath.shift()];
            }

            currentContainer[lastKey] = valueToSave;
            this.setState({data});
            this.props.onChange(data);
        }
    },

    // accessKeyId: '',
    // availabilityZone: 'a',
    // name: 'new AWS profile',
    // regionName: 'us-east-1',
    // secretAccessKey: '',

    render() {
        if(!this.state.data) {
            return null;
        }
        return (
            <div>
                <form onSubmit={(e) => {e.preventDefault()} }>
                    <section className={style.formItem}>
                        <label className={style.label}>Profile name</label>
                        <input className={style.form} type="text" value={this.state.data.name}
                            data-key="name" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Key Id</label>
                        <input className={style.form} type="text" value={this.state.data.accessKeyId}
                            data-key="accessKeyId" onChange={this.formChange} required />
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Secret Id</label>
                        <input className={style.form} type="password" value={this.state.data.secretAccessKey}
                            data-key="secretAccessKey" onChange={this.formChange} required/>
                        </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Region</label>
                        <select className={style.form} value={this.state.data.regionName}
                            data-key="regionName" onChange={this.formChange} required >
                            { Object.keys(this.props.regions).map( (reg, index) => {
                                return (<option key={reg+ '_' + index} value={reg}>{reg}</option>);
                            }) }
                        </select>
                    </section>
                    <section className={style.formItem}>
                        <label className={style.label}>Availability Zone</label>
                        <select className={style.form} value={this.state.data.availabilityZone}
                            data-key="availabilityZone" onChange={this.formChange} required>
                            { this.props.regions[this.state.data.regionName].map( (zone, index) => {
                                return (<option key={zone + '_' + index} value={zone}>{zone}</option>);
                            }) }
                        </select>
                    </section>
                </form>
            </div>);
    },
});
