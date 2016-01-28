import client       from '../../../network';
import contentForm  from './ClusterForm';
import deepClone    from 'mout/src/lang/deepClone';
import DetailView   from '../../../panels/DetailView';
import React        from 'react';
import style        from  '../style.mcss';
import { Link }     from 'react-router';

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
                    scheduler: {
                        type: 'sge',
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

        const clusterToDelete = clusters.splice(this.state.active, 1)[0];
        if (this.state.active === 0 && clusters.length > 0) {
            newActive = 0;
        } else if (this.state.active === 0) {
            newActive = null;
        } else {
            newActive = this.state.active-1;
        }
        this.setState({active: newActive});

        client.deleteCluster(clusterToDelete._id)
            .then(resp => this.updateState())
            .catch(err => {
                console.log('Error deleting cluster', err);
                this.updateState();
            });
    },

    changeItem(item) {
        var clusters = this.state.clusters;
        clusters[this.state.active] = item;
        this.setState({clusters});
    },

    saveItem(event) {
        const cluster = this.state.clusters[this.state.active];
        client.saveCluster(cluster)
            .then(resp => {
                this.setState({error: null});
                console.log('Success: Pref/Cluster/save', resp)
            })
            .catch(err => {
                this.setState({error: err.data.message});
                console.log('Error: Pref/Cluster/save', err)
            });
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
                    error={this.state.error}
                />
            </div>);
    },
});
