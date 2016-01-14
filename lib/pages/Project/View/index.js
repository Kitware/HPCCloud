import React                from 'react';
import ListPanel            from '../../../panels/ListPanel';
import LineListItems        from '../../../panels/LineListItems';
import SimulationRenderer   from '../../Simulation/Item/LineItem';

import ServerLessData from '../../../config/ServerLessData';

export default React.createClass({

    displayName: 'Project/View',

    propTypes: {
        params: React.PropTypes.object,
    },

    render() {
        const demoList = ServerLessData.projects[this.props.params.id].simulationIds.map( simId => {
            return ServerLessData.simulations[simId];
        });

        return <ListPanel
                    listComponent={ LineListItems }
                    itemRenderer={ SimulationRenderer }
                    list={ demoList }
                    add={ '/New/Simulation/' + this.props.params.id }
                    title={ "Project's simulations (" + ServerLessData.projects[this.props.params.id].name + ')'}/>;
    },
});
