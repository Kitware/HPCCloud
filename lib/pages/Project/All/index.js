import React         from 'react';
import ListPanel     from '../../../panels/ListPanel';
import LineListItems from '../../../panels/LineListItems';
import ProjectItem   from './Item';

import client from '../../../network/fakeClient';

export default React.createClass({

    displayName: 'Project/All',

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
                    listComponent={ LineListItems }
                    itemRenderer={ ProjectItem }
                    list={ this.state.projects }
                    add='/New/Project'
                    title='Project list'/>;
    },
});
