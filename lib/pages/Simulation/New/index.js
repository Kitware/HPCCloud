import React        from 'react';
import Workflows    from '../../../types';
import style        from 'hpccloud/style/GenericNew.mcss';
import GenericNew   from '../../Generic/New';

import client       from '../../../network';

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
            .catch(err => console.log('Error: Sim/New-get', err));
    },

    ok(data) {
        const { name, description } = data,
            projectId = this.props.params.projectId,
            steps = {},
            metadata = {},
            simulation = { name, description, steps, metadata, projectId };

        client.saveSimulation(simulation)
            .then( resp => {
                console.log('save sim', resp.data);
                this.context.router.replace('/View/Simulation/' + resp.data._id);
            })
            .catch(err => console.log('Error: Sim/New-save', err));
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
        const workflowAddOn = childComponent ? React.createElement(childComponent, { owner: this }) : null;
        return (
            <GenericNew title='New Simulation' ok={ this.ok } cancel={ this.cancel }>
                <div className={ style.formItem }>
                    { workflowAddOn }
                </div>
            </GenericNew>);
    },
});
