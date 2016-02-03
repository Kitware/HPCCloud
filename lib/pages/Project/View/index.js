import React                from 'react';
import { SimulationHelper } from '../../../utils/AccessHelper';
import TableListing         from '../../../panels/TableListing';

import client               from '../../../network';

export default React.createClass({

    displayName: 'Project/View',

    propTypes: {
        location: React.PropTypes.object,
        params: React.PropTypes.object,
    },

    contextTypes: {
        router: React.PropTypes.object,
    },

    getInitialState() {
        return {
            project: { name: '' },
            simulations: [],
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
        client.getProject(id)
            .then(resp => this.setState({project: resp.data}))
            .catch(err => {
                this.setState({ _error: err.data.message });
                console.log('Error Project/View-getProject', err)
            });

        client.getProjectSimulations(id)
            .then(resp => this.setState({simulations: resp.data}))
            .catch(err => {
                this.setState({ _error: err.data.message });
                console.log('Error Project/View-getProjectSimulations', err);
            });
    },

    createSimulation(e) {
        this.context.router.replace('/New/Simulation/' + this.props.params.id);
    },

    render() {
        return <TableListing
                    breadcrumb={{
                        paths: ['/', `/View/Project/${this.props.params.id}` ],
                        icons: ['fa fa-fw fa-list', 'fa fa-fw fa-folder-open-o']}}
                    location={ this.props.location }
                    accessHelper={ SimulationHelper }
                    items={ this.state.simulations }
                    onAction={ this.createSimulation }
                    title='Simulations'/>;
    },
});
