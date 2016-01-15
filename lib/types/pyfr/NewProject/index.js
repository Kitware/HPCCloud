import React from 'react';
import ReactDOM from 'react-dom';
import style from './style.mcss';
import Generic from '../../../pages/Generic/New/GenericNew.mcss';

export default React.createClass({

    displayName: 'Project/New/PyFr',

    getInitialState() {
        return {
            dropable: false,
            meshFileName: '',
        };
    },

    componentDidMount() {

    },
    
    componentWillUnmount(){    

    },

    processFile(event) {
        var file, 
            reader = new FileReader();
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
