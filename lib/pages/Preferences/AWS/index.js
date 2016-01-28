import React from 'react';
import { Link } from 'react-router';
import merge from 'mout/src/object/merge';
import client from '../../../network';
import contentForm from './AWSForm';
import DetailView from '../../../panels/DetailView';
import style    from  '../style.mcss';

export default React.createClass({

    displayName: 'Preferences/AWS',

    propTypes: {
        awsProfiles: React.PropTypes.array,
    },

    getInitialState() {
        return {
            active: 0,
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

    newActive(active) {
        this.setState({active});
    },

    addItem(event) {
        var profiles = this.state.profiles;
        profiles.push(merge({}, this.state.blankObject));
        this.setState({profiles, active: profiles.length-1});
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
                    <span>AWS EC2</span>
                    <i className="fa fa-plus" onClick={this.addItem}></i>
                </nav>
                <DetailView
                    newActive={this.newActive}
                    active={this.state.active}
                    contents={this.state.profiles}
                    component={contentForm} />
            </div>);
    },
});
