import React        from 'react';
import GenericNew   from '../../Generic/New';
import merge        from 'mout/src/object/merge';
import client       from '../../../network/fakeClient';

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
        client.getProject(id, project => this.setState({project}) );
    },

    ok(data) {
        const project = merge(this.state.project, data);

        client.saveProject(project, (p) => {
            this.context.router.replace('/View/Project/' + p.id);
        });
    },

    cancel() {
        this.context.router.replace('/View/Project/' + this.state.project.id);
    },

    delete() {
        client.deleteProject(this.state.project.id, (deletedProject) => {
            this.context.router.replace('/');
        });
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
