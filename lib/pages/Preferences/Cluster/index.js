import client           from '../../../network';
import ClusterForm      from './ClusterForm';
import deepClone        from 'mout/src/lang/deepClone';
import DetailView       from '../../../panels/DetailView';
import PreferenceSubBar from '../../../panels/PreferenceSubBar';
import FormButtonBar    from '../../../panels/FormButtonBar';
import React            from 'react';

export default React.createClass({

    displayName: 'Preferences/Cluster',

    propTypes: {
        clusterTemplate: React.PropTypes.object,
    },

    getDefaultProps() {
        return {
            clusterTemplate: {
                name: 'new cluster',
                type: 'trad',
                config: {
                    host: 'localhost',
                    ssh: {
                        user: 'Your_Login',
                    },
                    scheduler: {
                        type: 'sge',
                    },
                    parallelEnvironment: '',
                    numberOfSlots: 1,
                    jobOutputDir: '/tmp',
                    paraview: {
                        installDir: '/opt/paraview',
                    },
                },
            },
        };
    },

    getInitialState() {
        return {
            active: 0,
            clusters: [],
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

    changeItem(item) {
        var clusters = this.state.clusters;
        clusters[this.state.active] = item;
        this.setState({clusters});
    },

    activeChange(active) {
        this.setState({active});
    },

    addItem() {
        var clusters = this.state.clusters;
        clusters.push(deepClone(this.props.clusterTemplate));
        this.setState({clusters, active: clusters.length-1});
    },

    removeItem() {
        var clusters = this.state.clusters,
            newActive;

        const clusterToDelete = clusters.splice(this.state.active, 1)[0];
        if (this.state.active === 0 && clusters.length > 0) {
            newActive = 0;
        } else if (this.state.active === 0) {
            newActive = null;
        } else {
            newActive = this.state.active-1;
        }
        this.setState({active: newActive});

        client.deleteCluster(clusterToDelete._id)
            .then(resp => this.updateState())
            .catch(err => {
                console.log('Error deleting cluster', err);
                this.updateState();
            });
    },

    saveItem() {
        const cluster = this.state.clusters[this.state.active];
        client.saveCluster(cluster)
            .then(resp => {
                this.setState({error: null});
                console.log('Success: Pref/Cluster/save', resp)
            })
            .catch(err => {
                this.setState({error: err.data.message});
                console.log('Error: Pref/Cluster/save', err)
            });
    },

    formAction(action) {
        switch(action) {
            case 'save':
                this.saveItem();
                break;
            case 'delete':
                this.removeItem();
                break;
            case 'test':
                console.log('Need to trigger cluster test');
                break
        }
    },

    render() {
        const activeData = this.state.active < this.state.clusters.length ? this.state.clusters[this.state.active] : null;
        return (
            <div>
                <PreferenceSubBar
                        title='Clusters'
                        actionList={[{name: 'add', icon: 'fa fa-plus'}]}
                        onAction={this.addItem}/>
                <DetailView
                        onActiveChange={this.activeChange}
                        active={this.state.active}
                        contents={this.state.clusters}>
                    <ClusterForm
                        data={activeData}
                        onChange={ this.changeItem }/>
                    <FormButtonBar
                        visible={!!activeData}
                        onAction={ this.formAction }
                        error={ this.state.error }
                        actionList={[
                            {name:'save', label:'Save', icon:'fa fa-floppy-o'},
                            {name:'delete', label:'Delete', icon:'fa fa-trash-o'},
                            {name:'test', label:'Test', icon:'fa fa-repeat'},
                        ]} />
                </DetailView>
            </div>);
    },
});
