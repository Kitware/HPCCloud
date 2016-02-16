import client   from '../../network';
import React    from 'react';
import { Link } from 'react-router';

import style    from 'HPCCloudStyle/ItemEditor.mcss';
import theme    from 'HPCCloudStyle/Theme.mcss';

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
        client.listClusterProfiles()
            .then(resp => {
                this.setState({profiles: resp.data, profile:resp.data[0], busy:false});
                if (this.props.onChange) {
                    this.props.onChange('profile', resp.data[0]._id, 'Traditional');
                }
            })
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
                value={el._id}>
                    {el.name}
                </option>);
            };

        if(this.state.profiles.length === 0) {
            return this.state.busy ? null :
                    <div className={style.container + ' ' + theme.warningBox}>
                        <span>There are no Traditional Clusters defined. Add some on&nbsp;
                        <Link to='/Preferences/Cluster'>the Cluster preference page</Link>.
                        </span>
                    </div>;
        }

        return (
            <div className={style.container}>
                <section className={style.group}>
                    <label className={style.label}>Cluster:</label>
                    <select className={style.input} onChange={this.dataChange}
                        data-key="profile"
                        value={this.props.contents.profile._id}>
                        {this.state.profiles.map(optionMapper)}
                    </select>
                </section>
                <section className={style.group}>
                    <label className={style.label}>Max runtime:</label>
                    <input className={style.input} type="number" min="1"
                        data-key="maxRuntime"
                        value={this.props.contents.maxRuntime}
                        onChange={this.dataChange}/>
                </section>
            </div>
        );
    },
});
