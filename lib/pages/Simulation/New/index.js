import React        from 'react';
import Workflows    from '../../../types';
import style        from '../../Generic/New/GenericNew.mcss';
import GenericNew   from '../../Generic/New';

import client       from '../../../network/fakeClient';

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
        client.getProject(id, project => this.setState({project}) );
    },

    ok(data) {
        const { name, description } = data,
            project = this.props.params.projectId,
            simulation = { name, description, project };

        client.saveSimulation(simulation, (sim) => {
            this.context.router.replace('/View/Simulation/' + sim.id);
        })
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
