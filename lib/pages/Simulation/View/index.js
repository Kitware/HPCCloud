import React     from 'react';
import Workflows from '../../../types';

import ServerLessData from '../../../config/ServerLessData';

export default React.createClass({

    displayName: 'Simulation/View',

    render() {
        const simulation = ServerLessData.simulations[this.props.params.id];
        const project = ServerLessData.projects[simulation.project];
        const step = this.props.params.step || Workflows[project.type].steps._order[0];
        const view = this.props.location.query.view || 'default';
        const childComponent = Workflows[project.type].components.ViewSimulation;
        return (
            <div>
                { React.createElement(childComponent, { project, simulation, step, view }) }
            </div>);
    },
});
