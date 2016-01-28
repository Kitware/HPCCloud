import React from 'react';
import { Link } from 'react-router';
import merge from 'mout/src/object/merge';
import client from '../../../network';
import contentForm from './ClusterForm';
import DetailView from '../../../panels/DetailView';
import style    from  '../style.mcss';

export default React.createClass({

    displayName: 'Preferences/Cluster',

    getInitialState() {
        return {
            active: 0,
            clusters: [],
            blankObject: {
                name: 'new cluster',
                hostname: '',
                username: '',
                slots: '',
                parallelEnv: '',
                paraviewDir: '',
                type: 'trad',
            },
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
        clusters.push(merge({}, this.state.blankObject));
        this.setState({clusters, active: clusters.length-1});
    },

    removeItem(event) {

    },

    saveItem(event) {

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
                    active={this.state.active}
                    contents={this.state.clusters}
                    component={contentForm}
                />
            </div>);
    },
});
