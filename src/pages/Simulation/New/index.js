import ItemEditor   from '../../../panels/ItemEditor';
import React        from 'react';

import Workflows    from '../../../workflows';
import client       from '../../../network';

import breadCrumbStyle from 'HPCCloudStyle/Theme.mcss';

export default React.createClass({

    displayName: 'Simulation/New',

    propTypes: {
        params: React.PropTypes.object,
    },

    contextTypes: {
        router: React.PropTypes.object,
    },

    getInitialState() {
        return {
            project: null,
        };
    },

    componentWillMount() {
        this.updateProject();
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.projectId !== this.props.params.projectId) {
            this.updateProject(nextProps.params.projectId);
        }
    },

    updateProject(id=this.props.params.projectId) {
        client.getProject(id)
            .then(resp => this.setState({project: resp.data, error: false}))
            .catch(err => {
                var msg = err.data ? err.data.message : err.toString();
                this.setState({ _error: msg });
                console.log('Error: Sim/New-get', err)
            });
    },

    onAction(action, data, attachements) {
        this[action](data, attachements);
    },

    newSimulation(data, attachements) {
        const { name, description } = data,
            projectId = this.props.params.projectId,
            metadata = {},
            stepsInfo = Workflows[this.state.project.type].steps,
            steps = stepsInfo._initial_state,
            disabled = stepsInfo._disabled || [],
            active = stepsInfo._active || stepsInfo._order[0],
            simulation = { name, description, steps, metadata, projectId, active, disabled };

        client.saveSimulation(simulation, attachements)
            .then(resp => {
                var simId = Array.isArray(resp) ? resp[resp.length-1].data._id : resp.data._id;
                this.context.router.replace('/View/Simulation/' + simId);
            })
            .catch(err => {
                this.setState({ _error: err.data.message });
                console.log('Error: Sim/New-save', err)
            });
    },

    cancel() {
        this.context.router.replace('/View/Project/' + this.props.params.projectId);
    },

    render() {
        if(!this.state.project) {
            return null;
        }

        const type = this.state.project.type;
        const childComponent = type ? Workflows[type].components.NewSimulation : null;
        const workflowAddOn = childComponent ? React.createElement(childComponent, { owner: () => this.refs.container }) : null;
        return (
            <ItemEditor
                breadcrumb={{
                    paths:['/', `/View/Project/${this.state.project._id}`],
                    icons:[
                        breadCrumbStyle.breadCrumbRootIcon,
                        breadCrumbStyle.breadCrumbProjectIcon,
                    ],
                }}
                error={this.state._error}
                ref='container'
                title='New Simulation'
                actions={[
                    {name: 'cancel', label: 'Cancel'},
                    {name: 'newSimulation', label: 'Create simulation'},
                ]}
                onAction={ this.onAction }>

                { workflowAddOn }

            </ItemEditor>);
    },
});
