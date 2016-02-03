import React        from 'react';
import Toolbar      from '../Toolbar';
import ButtonBar    from '../ButtonBar';

import style    from 'HPCCloudStyle/ItemEditor.mcss';

const NoOp = function(){};

export default React.createClass({

    displayName: 'ItemEditor',

    propTypes: {
        actions: React.PropTypes.array,
        breadcrumb: React.PropTypes.object,
        children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
        description: React.PropTypes.string,
        error: React.PropTypes.string,
        name: React.PropTypes.string,
        onAction: React.PropTypes.func,
        title: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.string]),
    },

    getDefaultProps() {
        return {
            actions: [],
            description: '',
            error: '',
            name: '',
            onAction: NoOp,
            title: 'Item editor',
        };
    },

    getInitialState() {
        return {
            name: this.props.name,
            description: this.props.description,
        };
    },

    addAttachement(name, file) {
        const attachement = this.attachement || {};
        attachement[name] = file;
        this.attachement = attachement;
    },

    addMetadata(name, value) {
        const metadata = this.state.metadata || {};
        metadata[name] = value;
        this.setState({metadata});
    },

    updateForm(e) {
        var key = e.target.dataset.name,
            value = e.target.value;

        this.setState({ [key]:value });
    },

    onAction(action) {
        if(this.props.onAction) {
            this.props.onAction(action, this.state, this.attachement);
        }
    },

    render() {
        return (
            <div className={ style.container }>
                <Toolbar
                    breadcrumb={ this.props.breadcrumb || {paths:['/'], icons:['fa fa-fw fa-list']}}
                    title={ this.props.title } />

                <div className={ style.group }>
                    <div className={ style.label }> Name </div>
                    <input className={ style.input } type='text' value={ this.state.name } data-name='name' onChange={ this.updateForm }/>
                </div>
                <div className={ style.group }>
                    <div className={ style.label }> Description </div>
                    <textarea className={ style.input } data-name='description' rows='5' onChange={ this.updateForm } value={this.state.description}/>
                </div>
                { this.props.children }
                <ButtonBar error={this.props.error} actions={ this.props.actions } onAction={ this.onAction }/>
            </div>);
    },
});
