import React from 'react';
import client from '../../../network';
import contentForm from './AWSForm';
import DetailView from '../../../panels/DetailView';

export default React.createClass({

    displayName: 'Preferences/AWS',

    propTypes: {
        awsProfiles: React.PropTypes.array,
    },

    getInitialState() {
        return {
            profiles: [],
            blankObject: {
                name: 'new profile',
                idKey: '',
                secretKey: '',
                region: 'us-east-1',
                availabilityZone: 'a',
            },
        }
    },

    componentWillMount() {
        this.updateState();
    },

    updateState() {
        client.getAWSProfiles(profiles => {
            this.setState({profiles})
        });
    },

    addItem(event) {

    },

    removeItem(event) {

    },

    saveItem(event) {

    },

    render() {
        return <DetailView
            contents={this.state.profiles}
            blankObject={this.state.blankObject}
            component={contentForm}
            />
    },
});
