import React     from 'react';
import Workflows from '../../../types';
import client    from '../../../network';

export default React.createClass({

    displayName: 'Simulation/View',

    propTypes: {
        location: React.PropTypes.object,
        params: React.PropTypes.object,
    },

    getInitialState() {
        return {
            project: null,
            simulation: null,
        };
    },

    componentWillMount() {
        this.updateSimulation();
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.id !== this.props.params.id) {
            this.updateSimulation(nextProps.params.id);
        }
    },

    updateSimulation(id=this.props.params.id) {
        client.getSimulation(id)
            .then( respSimulation => {
                client.getProject(respSimulation.data.projectId)
                    .then( respProject => {
                        this.setState({project: respProject.data, simulation: respSimulation.data});
                    })
                    .catch( errProj => {
                        console.log('Error fetching project', errProj);
                    });
            })
            .catch( errSim => {
                console.log('Error fetching simulation', errSim);
            });
    },

    render() {
        if(!this.state.simulation || !this.state.project) {
            return null;
        }
        const { project, simulation } = this.state;
        const step = this.props.params.step || Workflows[project.type].steps._order[0] || Workflows[project.type].steps._order.default[0];
        const view = this.props.location.query.view || 'default';
        const childComponent = Workflows[project.type].components.ViewSimulation;
        if(childComponent) {
            return (<div>{ React.createElement(childComponent, { project, simulation, step, view }) }</div>);
        }
        return <div>No simulation view for simulation of type {project.type}.</div>
    },
});
