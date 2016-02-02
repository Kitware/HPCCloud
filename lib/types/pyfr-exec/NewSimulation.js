import React from 'react';
import Generic from 'hpccloud/style/GenericNew.mcss';

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
            <div className={Generic.formItem}>
                    <div className={Generic.label}>Mesh file (.msh)</div>
                    <div className={Generic.form} >
                        <input data-name='mesh' type="file" value={this.state.mesh} onChange={this.processFile}/>
                    </div>
            </div>
            <div className={Generic.formItem}>
                    <div className={Generic.label}>Ini file (.ini)</div>
                    <div className={Generic.form} >
                        <input data-name='ini' type="file" value={this.state.ini} onChange={this.processFile}/>
                    </div>
            </div>
            </div>);
    },
});
