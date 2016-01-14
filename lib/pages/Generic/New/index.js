import React from 'react';
import style from './generic-new.mcss';

const NoOp = function(){};

export default React.createClass({

    displayName: 'Generic/New',

    propTypes: {
        cancel: React.PropTypes.func,
        children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
        description: React.PropTypes.string,
        name: React.PropTypes.string,
        ok: React.PropTypes.func,
        title: React.PropTypes.string,
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

    updateForm(e) {
        var key = e.target.dataset.name,
            value = e.target.value;

        this.setState({ [key]:value });
    },

    ok() {
        this.props.ok(this.state);
    },

    cancel() {
        this.props.cancel(this.state);
    },

    render() {
        return (
            <div className={ style.container }>
                <div className={ style.titleBar }>
                    <span className={ style.left }>
                        <i className={ 'fa fa-fw fa-undo ' + style.action }  onClick={ this.cancel }></i>
                    </span>
                    <span className={ style.center }>
                        { this.props.title }
                    </span>
                    <span className={ style.right }>
                        <i className={'fa fa-fw fa-check ' + style.action } onClick={ this.ok }></i>
                    </span>
                </div>
                <div className={ style.formItem }>
                    <div className={ style.label }>
                        Name
                    </div>
                    <div className={ style.form }>
                        <input type='text' value={ this.state.name } data-name='name' onChange={ this.updateForm }/>
                    </div>
                </div>
                <div className={ style.formItem }>
                    <div className={ style.label }>
                        Description
                    </div>
                    <div className={ style.form }>
                        <textarea data-name='description' rows='5' onChange={ this.updateForm } value={this.state.description}/>
                    </div>
                </div>
                { this.props.children }
            </div>);
    },
});
