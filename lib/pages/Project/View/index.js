import React                from 'react';
import ListPanel            from '../../../panels/ListPanel';
import LineListItems        from '../../../panels/LineListItems';
import SimulationRenderer   from '../../Simulation/Item/LineItem';

import client               from '../../../network/fakeClient';

const EMPTY_PROJECT = {
    name: '',
}

export default React.createClass({

    displayName: 'Project/View',

    propTypes: {
        params: React.PropTypes.object,
    },

    getInitialState() {
        return {
            project: EMPTY_PROJECT,
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
        client.getProject(id, project => this.setState({project}) );
        client.getProjectSimulations( id, simulations => this.setState({simulations}) );
    },

    render() {
        return <ListPanel
                    listComponent={ LineListItems }
                    itemRenderer={ SimulationRenderer }
                    list={ this.state.simulations }
                    add={ '/New/Simulation/' + this.props.params.id }
                    title={ "Project's simulations (" + this.state.project.name + ')'}/>;
    },
});
