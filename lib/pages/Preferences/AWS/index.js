import React from 'react';
import CollapsibleElement from 'tonic-ui/lib/react/widget/CollapsibleElement';
import client       from '../../../network';
import superStyle from '../style.mcss';

export default React.createClass({

    displayName: 'Preferences/AWS',

    propTypes: {
        awsProfiles: React.PropTypes.array,
    },

    getInitialState() {
        return {
            profiles: null,
            lastIsNew: false,
            regions: {
                'us-east-1': ['a','b','c','d','e'],
                'us-west-1': ['a','b','c'],
                'us-west-2': ['a','b','c'],
                'eu-west-1': ['a','b','c'],
                'eu-central-1': ['a','b'],
                'ap-southeast-1': ['a','b'],
                'ap-southeast-2': ['a','b'],
                'ap-northeast-1': ['a','b','c'],
                'sa-east-1': ['a','b'],
            },
        }
    },

    componentWillMount() {
        this.updateState();
    },

    updateState() {
          client.getAWSProfiles(profiles => this.setState({profiles}));
    },

    handleSubmit(event) {
        event.preventDefault();
        this.saveProfile(event);
    },

    addProfile(event) {
        var newProfile = {
            name: '',
            idKey: '',
            secretKey: '',
            region: 'us-east-1',
            availabilityZone: 'a',
        },
        profiles = this.state.profiles;

        profiles.push(newProfile);
        this.setState({profiles, lastIsNew: true});
    },

    removeProfile(event) {
        var profileIndex = -1,
            newState = this.state.profiles;
        event.preventDefault();
        
        if (!confirm('Are you sure you want to delete this profile?')) {
            return;
        }
        
        if (event.target.tagName === 'SPAN') { //the button has a span in it which takes target?
            profileIndex = event.target.parentElement.form.dataset.idx;
        } else {
            profileIndex = event.target.form.dataset.idx;
        }

        newState.splice(profileIndex, 1);
        this.setState(newState);
    },

    saveProfile(event) {
        var profileIndex = -1;
        if (event.target.tagName === 'SPAN') { //the button has a span in it which takes target?
            profileIndex = event.target.parentElement.form.dataset.idx;
        } else if (event.target.tagName === 'FORM'){ //called from handle submit
            profileIndex = event.target.dataset.idx;  
        } else {
            profileIndex = event.target.form.dataset.idx;
        }
        
        client.saveAWSProfile(this.state.profiles[profileIndex], () => {});
    },

    titleBlur(event) {
        var profiles = this.state.profiles;
        profiles[profiles.length-1].name = event.target.value;
        this.setState({profiles, lastIsNew: false});
    },

    formChange(event) {
        var profileIndex = event.target.form.dataset.idx,
            key = event.target.dataset.key,
            updatedProfiles = this.state.profiles,
            profile = updatedProfiles[profileIndex];

        profile[key] = event.target.value;

        const currentAvailZone = this.state.profiles[profileIndex].availabilityZone;
        if (key === 'region' && 
            this.state.regions[event.target.value].indexOf(currentAvailZone) === -1) {
            profile.availabilityZone = 'a';
        }

        updatedProfiles[profileIndex] = profile;

        this.setState({profiles: updatedProfiles});
    },

    render() {
        var _this = this;
        function generateProfiles(profile, index, array) {
            var title;
            if (_this.state.lastIsNew && index === array.length-1 ) {
                title = <input ref="titleInput"
                    onKeyPress={(e) => e.charCode === 13 ? _this.refs.titleInput.blur() : null}
                    onBlur={_this.titleBlur}/>
            } else {
                title = profile.name;
            }
            return (
            <div className={superStyle.preferenceCollapsible} key={profile.name + '_' + index}>
                <CollapsibleElement title={title} open={false}>
                    <form onSubmit={_this.handleSubmit} data-idx={index}>
                        <label className={superStyle.preferenceFormLine}>Key Id
                            <input className={superStyle.fullWidth} type="text" value={profile.idKey}
                                data-key="idKey" onChange={_this.formChange} required />
                        </label>
                        <label className={superStyle.preferenceFormLine}>Secret Id
                            <input className={superStyle.fullWidth} type="password" value={profile.secretKey}
                                data-key="secretKey" onChange={_this.formChange} required/>
                        </label>
                        <label className={superStyle.preferenceFormLine}>Region
                            <select className={superStyle.fullWidth} value={profile.region}
                                data-key="region" onChange={_this.formChange} required >
                                { Object.keys(_this.state.regions).map( (reg) => {
                                    return (<option key={reg+ '_' + index} value={reg}>{reg}</option>);
                                }) }
                            </select>
                        </label>
                        <label className={superStyle.preferenceFormLine}>Availability Zone
                            <select className={superStyle.fullWidth} value={profile.availabilityZone}
                                data-key="availabilityZone" onChange={_this.formChange} required>
                                { _this.state.regions[profile.region].map( (zone) => {
                                    return (<option key={zone + '_' + index} value={zone}>{zone}</option>);
                                }) }
                            </select>
                        </label>
                        <div className={[superStyle.preferenceFormSubmitLine, superStyle.reverseRow].join(', ')}>
                            <button>Save <i className="fa fa-floppy-o"></i></button>
                            <button onClick={_this.removeProfile}>Delete <i className="fa fa-trash"></i></button>
                        </div>
                    </form>
                </CollapsibleElement>
            </div>);
        }

        const addProfileButton = (<i className="fa fa-plus" onClick={this.addProfile}></i>);

        return (<div className={superStyle.preferenceContainer}>
            <CollapsibleElement title="AWS Profiles" subtitle={addProfileButton}>
                {this.state.profiles.map(generateProfiles)}
            </CollapsibleElement>
        </div>);
    },
});
