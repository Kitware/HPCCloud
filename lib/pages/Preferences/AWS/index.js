import React from 'react';
import CollapsibleElement from 'tonic-ui/lib/react/widget/CollapsibleElement';
import client       from '../../../network/fakeClient';
import superStyle from '../style.mcss';

export default React.createClass({

    displayName: 'Preferences/AWS',

    propTypes: {
        awsProfiles: React.PropTypes.array,  
    },
    
    getInitialState() {
        return {
            profiles: null,
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
        console.log('submit!');
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
        console.log(profiles);
        this.setState({profiles});
    },
    
    removeProfile(event) {
        event.preventDefault();
        var profileIndex = -1,
            newState = this.state.profiles;
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
        } else {
            profileIndex = event.target.form.dataset.idx;
        }
        client.saveAWSProfile(this.state.profiles[profileIndex]);
    },
    
    formChange(event) {
        var profileIndex = event.target.form.dataset.idx,
            key = event.target.dataset.key,
            updatedProfiles = this.state.profiles,
            profile = updatedProfiles[profileIndex];
        
        profile[key] = event.target.value;
        
        const currentAvailZone = this.state.profiles[profileIndex].availabilityZone;
        if (key === 'region' && this.state.regions[event.target.value].indexOf(currentAvailZone) === -1) {
            profile.availabilityZone = 'a';
        }
        
        updatedProfiles[profileIndex] = profile;
        
        this.setState({profiles: updatedProfiles});
    },
    
    render() {
        var _this = this;
        function generateProfiles(profile, index) { 
            return (
            <div className={superStyle.preferenceCollapsible} key={profile.name + '_' + index}>
                <CollapsibleElement title={profile.name} open={true}>
                    <form onSubmit={_this.handleSubmit} data-idx={index}>
                        <label className={superStyle.preferenceFormLine}>Key Id
                            <input className={superStyle.fullWidth} type="password" value={profile.idKey} 
                                data-key="idKey" onChange={_this.formChange} required /> 
                        </label>
                        <label className={superStyle.preferenceFormLine}>Secret Id
                            <textarea className={superStyle.fullWidth} value={profile.secretKey} 
                                data-key="secretKey" onChange={_this.formChange} required>
                            </textarea>
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
