import React     from 'react';
import Workflows from '../../../workflows';
import client    from '../../../network';
import tools     from  '../../../tools';

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
        this.simulationSubscription = client.onSimulationChange( (simulation, envelope) => {
            if(simulation._id === this.props.params.id) {
                this.setState({simulation});
            }
        });
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.id !== this.props.params.id) {
            this.updateSimulation(nextProps.params.id);
        }
    },

    componentWillUnmount() {
        if(this.simulationSubscription) {
            this.simulationSubscription.unsubscribe();
            this.simulationSubscription = null;
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
        const wfModule = Workflows[project.type];
        const step = this.props.params.step || simulation.active || wfModule.steps._order[0];
        const taskFlowName = wfModule.taskFlows && wfModule.taskFlows[step] ? wfModule.taskFlows[step] : null;

        const view = this.props.location.query.view || 'default';
        const childComponent = tools[view] || wfModule.components.ViewSimulation;

        if(childComponent) {
            return (<div>{ React.createElement(childComponent, { project, simulation, step, view, taskFlowName, location:this.props.location }) }</div>);
        }
        return <center>No simulation view for simulation of type {project.type}.</center>
    },
});
