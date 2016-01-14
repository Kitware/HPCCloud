import React from 'react';
import CollapsibleElement from 'tonic-ui/lib/react/widget/CollapsibleElement';
import superStyle from '../style.mcss';

export default React.createClass({

    displayName: 'Preferences/AWS',

    propTypes: {
        awsProfiles: React.PropTypes.array,  
    },

    getDefaultProps() {
        return {
            awsProfiles: [
                {
                    name: 'My profile',
                    idKey: 'flhiu3hflukwjb3hfw8shnr1',
                    secretKey: 'keep it secret, keep it safe.',
                    region: 'sa-east-1',
                    availabilityZone: 'a',
                }, {
                    name: 'Some other profile',
                    idKey: 'flhdadadadadaweweweweweqwqwqw',
                    secretKey: 'I have secrets that would make yours feel insufficient',
                    region: 'us-east-1',
                    availabilityZone: 'a',
                },
            ],
        }    
    },
    
    getInitialState() {
        return {
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
    
    handleSubmit(event) {
        event.preventDefault();
        console.log('submit!');
    },
    
    render() {
        var _this = this;
        function generateProfiles(profile, index) { 
            return (
            <div className={superStyle.preferenceCollapsible} key={profile.name + '_' + index}>
                <CollapsibleElement title={profile.name} open={false}>
                    <form onSubmit={_this.handleSubmit}>
                        <label className={superStyle.preferenceFormLine}>Key Id
                            <input className={superStyle.fullWidth} type="password" value={profile.idKey} required /> 
                        </label>
                        <label className={superStyle.preferenceFormLine}>Secret Id
                            <textarea className={superStyle.fullWidth} value={profile.secretKey} required>
                            </textarea>
                        </label>
                        <label className={superStyle.preferenceFormLine}>Region
                            <select className={superStyle.fullWidth} value={profile.region}   required >
                                { Object.keys(_this.state.regions).map( (reg) => {
                                    return (<option key={reg+ '_' + index} value={reg}>{reg}</option>);
                                }) }
                            </select>
                        </label>
                        <label className={superStyle.preferenceFormLine}>Availability Zone
                            <select className={superStyle.fullWidth} value={profile.availabilityZone} required>
                                { _this.state.regions[profile.region].map( (zone) => {
                                    return (<option key={zone + '_' + index} value={zone}>{zone}</option>);
                                }) }
                            </select>
                        </label>
                        <div className={superStyle.preferenceFormSubmitLine}>
                            <button>Save</button>
                        </div>
                    </form>
                </CollapsibleElement>
            </div>);
        }
        
        return (<div className={superStyle.preferenceContainer}>
            <CollapsibleElement title="AWS Profiles">
                {this.props.awsProfiles.map(generateProfiles)}
            </CollapsibleElement>
        </div>);
    },
});
