import Menu         from '../../../panels/SimulationControlPanel';
import PyFrModule   from '../index.js';
import React        from 'react';

export default React.createClass({

    displayName: 'PyFrSimulation',

    propTypes: {
        project: React.PropTypes.object,
        simulation: React.PropTypes.object,
        step: React.PropTypes.string,
        view: React.PropTypes.string,
    },

    render() {
        const componentClass = PyFrModule.steps[this.props.step][this.props.view];
        const component = componentClass ? React.createElement(componentClass, this.props) : null;
        return (
            <div>
                <Menu tree={ PyFrModule.menu } simulationId={ this.props.simulation.id }/>
                { component }
            </div>);
    },
});
