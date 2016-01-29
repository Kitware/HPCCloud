import client   from '../../../network';
import React    from 'react';
import style    from '../New/GenericNew.mcss';
import { Link } from 'react-router';

export default React.createClass({
    displayName: 'run/cluster',

    propTypes: {
        contents: React.PropTypes.object,
        onChange: React.PropTypes.func,
    },

    getInitialState() {
        return {
            busy: false,
            clusters: [],
            cluster: '',
        };
    },

    componentWillMount() {
        this.updateState();
    },

    updateState() {
        this.setState({busy:true});
        client.listClusterProfiles()
            .then(resp => this.setState({clusters: resp.data, busy:false}))
            .catch(err => {
                console.log('Error: Sim/RunCluster', err);
                this.setState({busy:false});
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

        if(this.state.clusters.length === 0) {
            return this.state.busy ? null :
                    <div className={style.subcontainer}>
                        No Cluster profile defined. Please add them in your <Link to='/Preferences/Cluster'>Cluster preference page</Link>.
                    </div>;
        }

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
