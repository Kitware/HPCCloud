import React from 'react';
import client from '../../../network';
import contentForm from './ClusterForm';
import DetailView from '../../../panels/DetailView';

export default React.createClass({

    displayName: 'Preferences/Cluster',

    getInitialState() {
        return {
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
        client.getClusterProfiles((clusters) => {
            this.setState({clusters});
        });
    },

    addItem(event) {

    },

    removeItem(event) {

    },

    saveItem(event) {

    },

    render() {
        return (
            <DetailView
            contents={this.state.clusters}
            blankObject={this.state.blankObject}
            component={contentForm}
            />);
    },
});
