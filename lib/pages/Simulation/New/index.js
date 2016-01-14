import React        from 'react';
import Workflows    from '../../../types';
import style        from '../../Generic/New/generic-new.mcss';
import GenericNew   from '../../Generic/New';

import ServerLessData from '../../../config/ServerLessData';

export default React.createClass({

    displayName: 'Simulation/New',

    propTypes: {
        params: React.PropTypes.object,
    },

    contextTypes: {
        router: React.PropTypes.object,
    },

    ok(data) {
        const id = Math.random().toString(36).substring(7),
            { name, description } = data,
            project = this.props.params.projectId,
            simulation = { id, name, description, project };

        // Save new simulation
        ServerLessData.simulations[id] = simulation;
        ServerLessData.projects[project].simulationIds.push(id);
        // FIXME

        this.context.router.replace('/View/Simulation/' + id);
    },

    cancel() {
        this.context.router.replace('/View/Project/' + this.props.params.projectId);
    },

    render() {
        const type = ServerLessData.projects[this.props.params.projectId].type;
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
