/* global Simput */
import React from 'react';
import form from 'HPCCloudStyle/form.css';
import layout from 'HPCCloudStyle/layout.css';

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
            <div className={layout.verticalFlexContainer}>
                <div className={form.group}>
                        <div className={form.label}>Configuration File (.ini)</div>
                        <div className={form.input}>
                            <input type="file" value={this.state.meshFileName} onChange={this.processFile}/>
                        </div>
                </div>
                <div className={form.group}>
                    <div className={form.label}>Upload and validate step</div>
                    <div className={form.input}>
                            <button onClick={this.upload}>Upload</button>
                        </div>
                </div>
            </div>);
    },
});
