/* global Simput */
import React from 'react';
import Generic from '../../../pages/Generic/New/GenericNew.mcss';

export default React.createClass({

    displayName: 'PyFrUpload',

    propTypes: {
    },

    getDefaultProps() {
        return {
        };
    },

    getInitialState() {
        return {
        }
    },

    componentWillUnmount() {
    },

    processFile(e) {

    },

    upload() {

    },

    render() {
        return (
            <div className={Generic.container}>
                <div className={Generic.formItem}>
                        <div className={Generic.label}>Configuration File (.ini)</div>
                        <div className={Generic.form}>
                            <input type="file" value={this.state.meshFileName} onChange={this.processFile}/>
                        </div>
                </div>
                <div className={Generic.formItem}>
                    <div className={Generic.label}>Upload and validate step</div>
                    <div className={Generic.form}>
                            <button onClick={this.upload}>Upload</button>
                        </div>
                </div>
            </div>);
    },
});
