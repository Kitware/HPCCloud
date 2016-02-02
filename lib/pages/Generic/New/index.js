import React from 'react';
import layout from 'HPCCloudStyle/layout.css';
import states from 'HPCCloudStyle/states.css';
import form from 'HPCCloudStyle/form.css';
import theme from 'HPCCloudStyle/theme.mcss';

const NoOp = function(){};

export default React.createClass({

    displayName: 'Generic/New',

    propTypes: {
        cancel: React.PropTypes.func,
        children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
        description: React.PropTypes.string,
        name: React.PropTypes.string,
        ok: React.PropTypes.func,
        title: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.string]),
    },

    getDefaultProps() {
        return {
            ok: NoOp,
            cancel: NoOp,
            name: '',
            description: '',
            title: 'Generic New title',
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

    ok() {
        this.props.ok(this.state, this.attachement);
    },

    cancel() {
        this.props.cancel(this.state);
    },

    render() {
        return (
            <div className={ layout.verticalFlexContainer }>
                <div className={ theme.subBar }>
                    <span className={ layout.left }>
                        <i className={ 'fa fa-fw fa-arrow-left ' + states.action }  onClick={ this.cancel }></i>
                    </span>
                    <span className={ layout.textCenter }>
                        { this.props.title }
                    </span>
                    <span className={ layout.right }>
                        <i className={'fa fa-fw fa-check ' + states.action } onClick={ this.ok }></i>
                    </span>
                </div>
                <div className={ form.group }>
                    <div className={ form.label }> Name </div>
                    <input className={ form.input } type='text' value={ this.state.name } data-name='name' onChange={ this.updateForm }/>
                </div>
                <div className={ form.group }>
                    <div className={ form.label }> Description </div>
                    <textarea className={ form.input } data-name='description' rows='5' onChange={ this.updateForm } value={this.state.description}/>
                </div>
                { this.props.children }
            </div>);
    },
});
