import React        from 'react';
import Workflows    from '../../../types';
import form         from 'HPCCloudStyle/form.css';
import GenericNew   from '../../Generic/New';

import client from '../../../network';

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
            type: wfTypes[0].value,
        };
    },

    updateForm(e) {
        var key = e.target.dataset.name,
            value = e.target.value;

        this.setState({ [key]:value });
    },

    ok(data, attachements) {
        const { name, description } = data,
            type = this.state.type,
            orders = Workflows[type].steps._order,
            steps = Array.isArray(orders) ? orders : orders.default,
            metadata = data.metadata || {},
            project = { name, description, type, steps, metadata };


        client.saveProject(project, attachements)
            .then(resp => this.context.router.replace('/View/Project/' + resp.data._id))
            .catch(err => console.log("Error: Project/New", err));
    },

    cancel() {
        this.context.router.replace('/');
    },

    render() {
        const childComponent = this.state.type ? Workflows[this.state.type].components.NewProject : null;
        const workflowAddOn = childComponent ? React.createElement(childComponent, { owner: () => this.refs.container }) : null;
        return (
            <GenericNew ref='container' title='New Project' ok={ this.ok } cancel={ this.cancel }>
                <section className={ form.group }>
                    <label className={ form.label }> Type </label>
                    <select className={ form.input } data-name='type' onChange={ this.updateForm } value={this.state.type}>
                        { wfTypes.map( i => {
                            return <option key={i.value} value={i.value}>{i.label}</option>
                        })}
                    </select>
                </section>
                { workflowAddOn }
            </GenericNew>);
    },
});
