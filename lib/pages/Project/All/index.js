import client            from '../../../network';
import merge             from 'mout/src/object/merge';
import React             from 'react';
import TableListing      from '../../../panels/TableListing';
import { ProjectHelper } from '../../../utils/AccessHelper';

export default React.createClass({

    displayName: 'Project/All',

    propTypes: {
        location: React.PropTypes.object,
    },

    contextTypes: {
        router: React.PropTypes.object,
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

    createProject(e) {
        const filter = '';
        this.context.router.replace({
            pathname: '/New/Project',
            query: merge(this.props.location.query, {filter}),
            state: this.props.location.state,
        });
    },

    render() {
        return <TableListing
                    breadcrumb={{paths: ['/'], icons: ['fa fa-fw fa-list']}}
                    location={ this.props.location }
                    accessHelper={ ProjectHelper }
                    items={ this.state.projects }
                    onAction={ this.createProject }
                    title='Projects'/>;
    },
});
