import React        from 'react';
import Toolbar      from '../Toolbar';
import ButtonBar    from '../ButtonBar';

import style    from 'HPCCloudStyle/ItemEditor.mcss';

const NoOp = function(){};

/* eslint-disable react/no-multi-comp */
const FileUploadEntry = React.createClass({
    displayName: 'ItemEditor/FileUploadEntry',

    propTypes: {
        label: React.PropTypes.string,
        name: React.PropTypes.string,
        owner: React.PropTypes.func,
    },

    processFile(event) {
        var file;
        if (event.target.files.length) {
            file = event.target.files[0];
        } else if (event.dataTransfer.files.length) {
            file = event.dataTransfer.files[0];
        }
        event.preventDefault();
        event.stopPropagation();

        if (!file) {
            return;
        }

        // Let's record attachement
        const name = event.target.dataset.name;
        if(this.props.owner && name) {
            this.props.owner().addAttachement(name, file);
        }
    },

    render() {
        return (
            <div className={style.group}>
                <label className={style.label}>{this.props.label}</label>
                <input
                    className={style.input}
                    data-name={this.props.name}
                    type='file'
                    onChange={this.processFile}/>
            </div>);
    },
});


const TextEntry = React.createClass({
    displayName: 'ItemEditor/TextEntry',

    propTypes: {
        default: React.PropTypes.string,
        label: React.PropTypes.string,
        name: React.PropTypes.string,
        owner: React.PropTypes.func,
    },

    getInitialState() {
        return {
            [this.props.name]: this.props.default || '',
        };
    },

    updateMetadata(event) {
        const name = event.target.dataset.name,
            value = event.target.value;

        this.setState({[name]:value});

        if(this.props.owner && name) {
            this.props.owner().addMetadata(name, value);
        }
    },

    render() {
        return (
            <div className={style.group}>
                <label className={style.label}>{this.props.label}</label>
                <input
                    className={style.input}
                    data-name={this.props.name}
                    type='text'
                    value={ this.state[this.props.name] }
                    onChange={this.updateMetadata}/>
            </div>);
    },
});

export { FileUploadEntry, TextEntry }

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
                    breadcrumb={ this.props.breadcrumb || {paths:['/'], icons:[ style.listIcon ]}}
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

/* eslint-enable react/no-multi-comp */
