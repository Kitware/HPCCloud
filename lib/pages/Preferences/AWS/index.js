import client       from '../../../network';
import contentForm  from './AWSForm';
import deepClone    from 'mout/src/lang/deepClone';
import DetailView   from '../../../panels/DetailView';
import React        from 'react';
import style        from  '../style.mcss';
import { Link }     from 'react-router';

export default React.createClass({

    displayName: 'Preferences/AWS',

    propTypes: {
        awsProfiles: React.PropTypes.array,
        awsTemplate: React.PropTypes.object,
    },

    getDefaultProps() {
        return {
            awsTemplate: {
                accessKeyId: '',
                availabilityZone: 'a',
                name: 'new AWS profile',
                regionName: 'us-east-1',
                secretAccessKey: '',
            },
        };
    },

    getInitialState() {
        return {
            active: 0,
            profiles: [],
        }
    },

    componentWillMount() {
        this.updateState();
    },

    updateState() {
        client.listAWSProfiles()
            .then(resp => this.setState({profiles: resp.data}))
            .catch(err => console.log('Error: Pref/AWS/list', err));
    },

    newActive(active) {
        this.setState({active});
    },

    addItem(event) {
        var profiles = this.state.profiles;
        profiles.push(deepClone(this.props.awsTemplate));
        this.setState({profiles, active: profiles.length-1});
    },

    removeItem(event) {
        var profiles = this.state.profiles,
            newActive;

        const profileToDelete = profiles.splice(this.state.active, 1)[0];
        if (this.state.active === 0 && profiles.length > 0) {
            newActive = 0;
        } else if (this.state.active === 0) {
            newActive = null;
        } else {
            newActive = this.state.active-1;
        }
        this.setState({active: newActive});

        client.deleteAWSProfile(profileToDelete._id)
            .then(resp => this.updateState())
            .catch(err => {
                console.log('Error deleting cluster', err);
                this.updateState();
            });
    },

    changeItem(item) {
        var profiles = this.state.profiles;
        profiles[this.state.active] = item;
        this.setState({profiles});
    },

    saveItem(event) {
        const aws = this.state.profiles[this.state.active];

        client.saveAWSProfile(aws)
            .then(resp => {
                this.setState({error: null});
                console.log('Success: Pref/AWS/save', resp)
            })
            .catch(err => {
                this.setState({error: err.data.message});
                console.log('Error: Pref/AWS/save', err)
            });
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
                    component={contentForm}

                    itemDelete={this.removeItem}
                    itemChange={this.changeItem}
                    itemSave={this.saveItem}

                    error={this.state.error}/>
            </div>);
    },
});
