import React      from 'react';
import GenericNew from '../../Generic/New';
import merge      from 'mout/src/object/merge';
import client     from '../../../network';

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
        client.getSimulation(id)
            .then( resp => this.setState({simulation : resp.data}))
            .catch( respErr => console.log('(EDIT) Error fetching sim', respErr));
    },

    ok(data) {
        const simulation = merge(this.state.simulation, data);

        client.saveSimulation(simulation)
            .then( resp => this.context.router.replace('/View/Simulation/' + simulation._id))
            .catch( err => console.log('(Edit) error saving', err));
    },

    cancel() {
        this.context.router.replace('/View/Project/' + this.state.simulation.project);
    },

    delete() {
        client.deleteSimulation(this.state.simulation._id)
            .then(resp => this.context.router.replace('/View/Project/' + this.state.simulation.projectId))
            .catch(err => console.log('(EDIT) Error delete sim', err));
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
