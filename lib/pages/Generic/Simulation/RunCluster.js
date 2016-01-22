import React from 'react';
import style from '../New/GenericNew.mcss';
import client from '../../../network';

export default React.createClass({
    displayName: 'run/cluster',

    propTypes: {
        contents: React.PropTypes.object,
        onChange: React.PropTypes.func,
    },

    getInitialState() {
        return {
            clusters: [],
            cluster: '',
        };
    },

    componentWillMount() {
        this.updateState();
    },

    updateState() {
        client.getClusterProfiles((clusters) => {
            this.setState({clusters});
        });
    },

    dataChange(event) {
        if (this.props.onChange) {
            this.props.onChange(event.target.dataset.key, event.target.value, 'Traditional');
        }
    },

    render() {
        var optionMapper = (el, index) => {
            return (<option key={el.name + '_' + index}
                value={el.name}>
                    {el.name}
                </option>);
            };

        return (
            <div className={style.subcontainer}>
                <section className={style.formItem}>
                    <div className={style.label}>Cluster:</div>
                    <div className={style.form}>
                        <select onChange={this.dataChange}
                            data-key="cluster"
                            value={this.props.contents.cluster}
                            defaultValue={this.state.clusters[0].name}>
                            {this.state.clusters.map(optionMapper)}
                        </select>
                    </div>
                </section>
                <section className={style.formItem}>
                    <div className={style.label}>Max runtime:</div>
                    <div className={style.form}>
                        <input type="number" min="1"
                            data-key="maxRuntime"
                            value={this.props.contents.maxRuntime}
                            onChange={this.dataChange}/>
                    </div>
                </section>
            </div>
        );
    },
});