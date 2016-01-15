import React         from 'react';
import ListPanel     from '../../../panels/ListPanel';
import LineListItems from '../../../panels/LineListItems';
import ProjectItem   from '../Item/LineItem';

import client from '../../../network';

export default React.createClass({

    displayName: 'Project/All',

    propTypes: {
        location: React.PropTypes.object,
    },

    getInitialState() {
        return {
            projects: [],
        };
    },

    componentWillMount() {
        this.updateProjectList();
    },

    updateProjectList() {
        client.listProjects( projects => this.setState({projects}) );
    },

    render() {
        return <ListPanel
                    location={ this.props.location }
                    listComponent={ LineListItems }
                    itemRenderer={ ProjectItem }
                    list={ this.state.projects }
                    add='/New/Project'
                    title='Project list'/>;
    },
});
