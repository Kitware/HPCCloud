import React from 'react';
import style from './style.mcss';
import Generic from '../../../pages/Generic/New/GenericNew.mcss';

export default React.createClass({

    displayName: 'Project/New/PyFr',

    propTypes: {
        owner: React.PropTypes.func,
    },

    getInitialState() {
        return {
            dropable: false,
            meshFileName: null,
        };
    },

    componentDidMount() {

    },

    componentWillUnmount(){

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

        this.setState({meshFileName: file.name});

        // Let's record attachement
        if(this.props.owner) {
            this.props.owner().addAttachement('mesh', file);
        }
    },

    render() {
        return (<div className={Generic.formItem}>
                    <div className={Generic.label}>Mesh File (.msh)</div>
                    <div className={Generic.form + ' ' + (this.state.dropable ? style.dropable : '')} ref="dropzone" >
                        <input type="file" value={this.state.meshFileName} onChange={this.processFile}/>
                    </div>
            </div>);
    },
});
