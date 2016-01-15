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
            clusters: null
        }
    },

    componentWillMount() {
        this.updateState();
    },

    updateState() {
          client.getClusters(clusters => this.setState({clusters}));
    },

    handleSubmit(event) {
        event.preventDefault();
        this.saveProfile(event);
    },

    addCluster(event) {
        var newProfile = {
            name: '',
            idKey: '',
            secretKey: '',
            region: 'us-east-1',
            availabilityZone: 'a',
        },
        clusters = this.state.clusters;

        clusters.push(newProfile);
        this.setState({clusters});
    },

    removeCluster(event) {
        var profileIndex = -1,
            newState = this.state.clusters;
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

    saveCluster(event) {
        var profileIndex = -1;
        if (event.target.tagName === 'SPAN') { //the button has a span in it which takes target?
            profileIndex = event.target.parentElement.form.dataset.idx;
        } else if (event.target.tagName === 'FORM'){ //called from handle submit
            profileIndex = event.target.dataset.idx;  
        } else {
            profileIndex = event.target.form.dataset.idx;
        }
        
        client.saveAWSProfile(this.state.clusters[profileIndex], () => {});
    },

    formChange(event) {
        var profileIndex = event.target.form.dataset.idx,
            key = event.target.dataset.key,
            updatedProfiles = this.state.clusters,
            profile = updatedProfiles[profileIndex];

        profile[key] = event.target.value;

        const currentAvailZone = this.state.clusters[profileIndex].availabilityZone;
        if (key === 'region' && 
            this.state.regions[event.target.value].indexOf(currentAvailZone) === -1) {
            profile.availabilityZone = 'a';
        }

        updatedProfiles[profileIndex] = profile;

        this.setState({clusters: updatedProfiles});
    },

    render() {
        var _this = this;
        function generateClusters(cluster, index) {
            return (
            <div className={superStyle.preferenceCollapsible} key={cluster.name + '_' + index}>
                <CollapsibleElement title={cluster.name} open={false}>
                    <form onSubmit={_this.handleSubmit} data-idx={index}>
                        <label className={superStyle.preferenceFormLine}>Key Id
                            <input className={superStyle.fullWidth} type="text" value={cluster.hostname}
                                data-key="hostname" onChange={_this.formChange} required />
                        </label>
                        <label className={superStyle.preferenceFormLine}>Secret Id
                            <input className={superStyle.fullWidth} type="text" value={cluster.username}
                                data-key="username" onChange={_this.formChange} required />
                        </label>
                        <label className={superStyle.preferenceFormLine}>Secret Id
                            <input className={superStyle.fullWidth} type="text" value={cluster.slots}
                                data-key="Number of Slots" onChange={_this.formChange} required />
                        </label>
                        <label className={superStyle.preferenceFormLine}>Secret Id
                            <input className={superStyle.fullWidth} type="text" value={cluster.parallelEnv}
                                data-key="Parallel Environment" onChange={_this.formChange} required />
                        </label>
                        <label className={superStyle.preferenceFormLine}>Secret Id
                            <input className={superStyle.fullWidth} type="text" value={cluster.paraviewDir}
                                data-key="Paraview Install Directory" onChange={_this.formChange} required />
                        </label>
                        
                        <div className={[superStyle.preferenceFormSubmitLine, superStyle.reverseRow].join(', ')}>
                            <button>Save <i className="fa fa-floppy-o"></i></button>
                            <button onClick={_this.removeCluster}>Delete <i className="fa fa-trash"></i></button>
                        </div>
                    </form>
                </CollapsibleElement>
            </div>);
        }

        const addClusterButton = (<i className="fa fa-plus" onClick={this.addCluster}></i>);

        return (<div className={superStyle.preferenceContainer}>
            <CollapsibleElement title="Cluster Profiles" subtitle={addClusterButton}>
                {this.state.clusters.map(generateClusters)}
            </CollapsibleElement>
        </div>);
    },
});

