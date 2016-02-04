import ItemEditor   from '../../../panels/ItemEditor';
import React        from 'react';
import Workflows    from '../../../workflows';

import client       from '../../../network';

import style        from 'HPCCloudStyle/ItemEditor.mcss';

const wfTypes = Object.keys(Workflows).map( value => {
    return { value, label: Workflows[value].name };
});

export default React.createClass({

    displayName: 'Project/New',

    contextTypes: {
        router: React.PropTypes.object,
    },

    getInitialState() {
        return {
            _error: '',
            type: wfTypes[0].value,
        };
    },

    updateForm(e) {
        var key = e.target.dataset.name,
            value = e.target.value;

        this.setState({ [key]:value });
    },

    onAction(action, data, attachements) {
        this[action](data, attachements);
    },

    newProject(data, attachements) {
        const { name, description } = data,
            type = this.state.type,
            orders = Workflows[type].steps._order,
            steps = Array.isArray(orders) ? orders : orders.default,
            metadata = data.metadata || {},
            project = { name, description, type, steps, metadata };


        client.saveProject(project, attachements)
            .then(resp => this.context.router.push('/View/Project/' + resp.data._id))
            .catch(err => {
                this.setState({ _error: err.data.message });
                console.log("Error: Project/New", err)
            });
    },

    cancel() {
        this.context.router.replace('/');
    },

    render() {
        const childComponent = this.state.type ? Workflows[this.state.type].components.NewProject : null;
        const workflowAddOn = childComponent ? React.createElement(childComponent, { owner: () => this.refs.container }) : null;
        return (
            <ItemEditor
                error={this.state._error}
                ref='container'
                title='New Project'
                actions={[
                    {name: 'cancel', label: 'Cancel'},
                    {name: 'newProject', label: 'Create project'},
                ]}
                onAction={ this.onAction }>

                <section className={ style.group }>
                    <label className={ style.label }> Type </label>
                    <select className={ style.input } data-name='type' onChange={ this.updateForm } value={this.state.type}>
                        { wfTypes.map( i => {
                            return <option key={i.value} value={i.value}>{i.label}</option>
                        })}
                    </select>
                </section>

                { workflowAddOn }

            </ItemEditor>);
    },
});
