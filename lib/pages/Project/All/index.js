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
        client.listProjects()
            .then(resp => this.setState({projects: resp.data}))
            .catch(err => console.log('Error Project/All', err));
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
