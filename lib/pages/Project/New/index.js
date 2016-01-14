import React        from 'react';
import Workflows    from '../../../types';
import style        from '../../Generic/New/GenericNew.mcss';
import GenericNew   from '../../Generic/New';

import client from '../../../network/fakeClient';

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
            type: '',
        };
    },

    updateForm(e) {
        var key = e.target.dataset.name,
            value = e.target.value;

        this.setState({ [key]:value });
    },

    ok(data) {
        const { name, description } = data,
            type = this.state.type,
            project = { name, description, type, simulationIds: [] };

        client.saveProject(project, (p) => {
            this.context.router.replace('/View/Project/' + p.id);
        });
    },

    cancel() {
        this.context.router.replace('/');
    },

    render() {
        const childComponent = this.state.type ? Workflows[this.state.type].components.NewProject : null;
        const workflowAddOn = childComponent ? React.createElement(childComponent, { owner: this }) : null;
        return (
            <GenericNew title='New Project' ok={ this.ok } cancel={ this.cancel }>
                <div className={ style.formItem }>
                    <div className={ style.label }>
                        Type
                    </div>
                    <div className={ style.form }>
                        <select data-name='type' onChange={ this.updateForm } value={this.state.type}>
                            { wfTypes.map( i => {
                                return <option key={i.value} value={i.value}>{i.label}</option>
                            })}
                        </select>
                    </div>
                </div>
                <div className={ style.formItem }>
                    { workflowAddOn }
                </div>
            </GenericNew>);
    },
});
