import React from 'react';
import style from 'HPCCloudStyle/ItemEditor.mcss';

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
        return (
            <div>
                <div className={style.group}>
                    <label className={style.label}>Mesh file (.msh)</label>
                    <input
                        className={style.input}
                        data-name='mesh'
                        type="file"
                        value={this.state.mesh}
                        onChange={this.processFile}/>
                </div>
            </div>);
    },
});
