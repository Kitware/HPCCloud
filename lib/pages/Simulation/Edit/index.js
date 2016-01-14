import React      from 'react';
import GenericNew from '../../Generic/New';
import merge      from 'mout/src/object/merge';
import client     from '../../../network/fakeClient';

export default React.createClass({

    displayName: 'Simulation/Edit',

    propTypes: {
        params: React.PropTypes.object,
    },

    contextTypes: {
        router: React.PropTypes.object,
    },

    getInitialState() {
        return {
            simulation: null,
        };
    },

    componentWillMount() {
        this.updateState();
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.id !== this.props.params.id) {
            this.updateState(nextProps.params.id);
        }
    },

    updateState(id = this.props.params.id) {
        client.getSimulation(id, simulation => this.setState({simulation}) );
    },

    ok(data) {
        const simulation = merge(this.state.simulation, data);

        client.saveSimulation(simulation, (p) => {
            this.context.router.replace('/View/Simulation/' + p.id);
        });
    },

    cancel() {
        this.context.router.replace('/View/Simulation/' + this.state.simulation.id);
    },

    delete() {
        client.deleteSimulation(this.state.simulation.id, (deletedSimulation) => {
            this.context.router.replace('/View/Project/' + this.state.simulation.project);
        });
    },

    render() {
        if(!this.state.simulation) {
            return null;
        }

        return <GenericNew title={ <div><i className='fa fa-fw fa-trash-o is-clickable' onClick={ this.delete }></i>Edit Simulation</div> }
                    name={ this.state.simulation.name }
                    description={ this.state.simulation.description }
                    ok={ this.ok }
                    cancel={ this.cancel }/>;
    },
});
