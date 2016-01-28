import React from 'react';
import { Link } from 'react-router';
import deepClone from 'mout/src/lang/deepClone';
import client from '../../../network';
import contentForm from './ClusterForm';
import DetailView from '../../../panels/DetailView';
import style    from  '../style.mcss';

export default React.createClass({

    displayName: 'Preferences/Cluster',

    propTypes: {
        clusterTemplate: React.PropTypes.object,
    },

    getDefaultProps() {
        return {
            clusterTemplate: {
                name: 'new cluster',
                type: 'trad',
                config: {
                    host: 'localhost',
                    ssh: {
                        user: 'Your_Login',
                    },
                    parallelEnvironment: '',
                    numberOfSlots: 1,
                    jobOutputDir: '/tmp',
                    paraview: {
                        installDir: '/opt/paraview',
                    },
                },
            },
        };
    },

    getInitialState() {
        return {
            active: 0,
            clusters: [],
        };
    },

    componentWillMount() {
        this.updateState();
    },

    updateState() {
        client.listClusterProfiles()
            .then(resp => this.setState({clusters: resp.data}))
            .catch(err => console.log('Error: Pref/Cluster/list', err));
    },

    newActive(active) {
        this.setState({active});
    },

    addItem(event) {
        var clusters = this.state.clusters;
        clusters.push(deepClone(this.props.clusterTemplate));
        this.setState({clusters, active: clusters.length-1});
    },

    removeItem(event) {
        var clusters = this.state.clusters,
            newActive;
        clusters.splice(this.state.active, 1);
        if (this.state.active === 0 && clusters.length > 0) {
            newActive = 0;
        } else if (this.state.active === 0) {
            newActive = null;
        } else {
            newActive = this.state.active-1;
        }
        this.setState({clusters, active: newActive});
    },

    changeItem(item) {
        var clusters = this.state.clusters;
        clusters[this.state.active] = item;
        this.setState({clusters});
    },

    saveItem(event) {
        console.log('save me');
    },

    render() {
        return (
            <div>
                <nav className={style.preferencesToolbar}>
                    <Link to='/Preferences'><i className="fa fa-th"></i></Link>
                    <span>Clusters</span>
                    <i className="fa fa-plus" onClick={this.addItem}></i>
                </nav>
                <DetailView
                    newActive={this.newActive}
                    itemDelete={this.removeItem}
                    itemChange={this.changeItem}
                    itemSave={this.saveItem}
                    active={this.state.active}
                    contents={this.state.clusters}
                    component={contentForm}
                />
            </div>);
    },
});
