import AWSForm          from './AWSForm';
import client           from '../../../network';
import deepClone        from 'mout/src/lang/deepClone';
import DetailView       from '../../../panels/DetailView';
import FormButtonBar    from '../../../panels/FormButtonBar';
import PreferenceSubBar from '../../../panels/PreferenceSubBar';
import React            from 'react';

export default React.createClass({

    displayName: 'Preferences/AWS',

    propTypes: {
        awsTemplate: React.PropTypes.object,
    },

    getDefaultProps() {
        return {
            awsTemplate: {
                accessKeyId: '',
                availabilityZone: 'us-east-1a',
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
            error: '',
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

    changeItem(item) {
        var profiles = this.state.profiles;
        profiles[this.state.active] = item;
        this.setState({profiles, error: ''});
    },

    activeChange(active) {
        this.setState({active, error: ''});
    },

    addItem() {
        var profiles = this.state.profiles;
        profiles.push(deepClone(this.props.awsTemplate));
        this.setState({profiles, active: profiles.length-1});
    },

    removeItem() {
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

    saveItem() {
        const profiles = this.state.profiles;
        const aws = profiles[this.state.active];

        client.saveAWSProfile(aws)
            .then(resp => {
                aws._id = resp.data._id;
                this.setState({profiles, error: ''});
            })
            .catch(err => {
                this.setState({error: err.data.message});
                console.log('Error: Pref/AWS/save', err)
            });
    },

    formAction(action) {
        this[action]();
    },

    render() {
        const activeData = this.state.active < this.state.profiles.length ? this.state.profiles[this.state.active] : null;
        return (
            <div>
                <PreferenceSubBar
                        title='AWS EC2'
                        actionList={[{name: 'add', icon: 'fa fa-plus'}]}
                        onAction={this.addItem}/>
                <DetailView
                        onActiveChange={this.activeChange}
                        active={this.state.active}
                        contents={this.state.profiles}>
                    <AWSForm
                        data={activeData}
                        onChange={ this.changeItem }/>
                    <FormButtonBar
                        visible={!!activeData}
                        onAction={ this.formAction }
                        error={ this.state.error }
                        actionList={[
                            {name:'saveItem', label:'Save', icon:'fa fa-floppy-o'},
                            {name:'removeItem', label:'Delete', icon:'fa fa-trash-o'},
                        ]} />
                </DetailView>
            </div>);
    },
});
