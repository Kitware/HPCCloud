import React        from 'react';
import GenericNew   from '../../Generic/New';
import merge        from 'mout/src/object/merge';
import client       from '../../../network';

export default React.createClass({

    displayName: 'Project/Edit',

    propTypes: {
        params: React.PropTypes.object,
    },

    contextTypes: {
        router: React.PropTypes.object,
    },

    getInitialState() {
        return {
            project: null,
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
            .catch( err => console.log('Error: Project/Edit-get', err));
    },

    ok(data) {
        const project = merge(this.state.project, data);
        client.saveProject(project)
            .then(resp => this.context.router.replace('/View/Project/' + this.state.project._id))
            .catch(err => console.log('Error: Project/Edit-save', err));
    },

    cancel() {
        this.context.router.replace('/View/Project/' + this.state.project._id);
    },

    delete() {
        client.deleteProject(this.state.project._id)
            .then(resp => this.context.router.replace('/'))
            .catch(err => console.log('Error: Project/Edit-delete', err));
    },

    render() {
        if(!this.state.project) {
            return null;
        }

        return <GenericNew
                    title={ <div><i className='fa fa-fw fa-trash-o is-clickable' onClick={ this.delete }></i>Edit Project</div> }
                    name={ this.state.project.name }
                    description={ this.state.project.description }
                    ok={ this.ok }
                    cancel={ this.cancel }/>;
    },
});
