/* global Simput */
import React                from 'react';

import modelGenerator       from 'simput/lib/modelGenerator';
import PropertyPanelBlock   from 'tonic-ui/lib/react/properties';
import SimputLabels         from 'simput/lib/Labels';
import ViewMenu             from 'simput/lib/ViewMenu';

import style                from './Simput.mcss';

export default React.createClass({

    displayName: 'PyFrSimput',

    propTypes: {
        convert: React.PropTypes.func,
        model: React.PropTypes.object,
    },

    getDefaultProps() {
        return {
            // PyFr Simput code
            model: Simput.types.pyfr.model,
            convert: Simput.types.pyfr.convert,
        };
    },

    getInitialState() {
        return {
            // Simput root data
            jsonData: { data: {} },
            results: null,

            // Language support
            labels: new SimputLabels(Simput.types.pyfr, 'en'),
            help: Simput.types.pyfr.lang.en.help,

            // UI content management
            data: [],
            viewData: {},
        }
    },

    componentWillUnmount() {
        this.saveModel();
    },

    saveModel() {
        try {
            const results = this.props.convert(this.state.jsonData);
            this.setState({results});
            console.log('SAVE: JSON data', this.state.jsonData);
            console.log('SAVE: Generated data', this.state.results);
        } catch(e) {
            console.log('SAVE: try/catch', e);
        }
    },

    updateActive(viewId, index) {
        const data = modelGenerator(this.props.model, this.state.jsonData, viewId, index,
                this.state.labels.activeLabels.attributes, this.state.help),
            viewData = this.state.jsonData.data[viewId][index];
        this.setState({data, viewData});
        setImmediate(this.saveModel);
    },

    updateViewData(newData) {
        const data = this.state.viewData,
            keypath = newData.id.split('.'),
            attrName = keypath.shift();

        data[attrName][keypath.join('.')].value = newData.value;
        this.setState({viewData: data});
    },

    render() {
        if(!this.state.jsonData) {
            return null;
        }

        return (
            <div className={ style.container }>
                <ViewMenu
                    data={ this.state.jsonData }
                    model={ this.props.model }
                    labels={ this.state.labels }
                    onChange={ this.updateActive }/>
                <PropertyPanelBlock
                    input={ this.state.data }
                    labels={ this.state.labels }
                    viewData={ this.state.viewData }
                    onChange={ this.updateViewData } />
            </div>);
    },
});
