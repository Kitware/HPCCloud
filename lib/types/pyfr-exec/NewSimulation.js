import React from 'react';
import form from 'HPCCloudStyle/form.css';

export default React.createClass({

    displayName: 'Simulation/New/PyFrExec',

    propTypes: {
        owner: React.PropTypes.func,
    },

    getInitialState() {
        return {
            ini: null,
            mesh: null,
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

        const name = event.target.dataset.name;
        this.setState({[name]: file.name});

        // Let's record attachement
        if(this.props.owner) {
            this.props.owner().addAttachement(name, file);
        }
    },

    render() {
        return (<div>
            <div className={form.group}>
                    <div className={form.label}>Mesh file (.msh)</div>
                    <div className={form.input} >
                        <input data-name='mesh' type="file" value={this.state.mesh} onChange={this.processFile}/>
                    </div>
            </div>
            <div className={form.group}>
                    <div className={form.label}>Ini file (.ini)</div>
                    <div className={form.input} >
                        <input data-name='ini' type="file" value={this.state.ini} onChange={this.processFile}/>
                    </div>
            </div>
            </div>);
    },
});
