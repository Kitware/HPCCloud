import deepEquals   from 'mout/src/lang/deepEquals';
import React        from 'react';
import Workflows    from '../../../types';
import form        from 'HPCCloudStyle/form.css';

const allConfigs = {};

for(const wfName in Workflows) {
    const wf = Workflows[wfName];
    if(wf.config && wf.config.cluster) {
        for(const propKey in wf.config.cluster) {
           allConfigs[propKey] = wf.config.cluster[propKey];
        }
    }
}

function getValue(obj, path) {
    var varNames = path.split('.'),
        result = obj;
    while(varNames.length && result) {
        result = result[varNames.shift()];
    }
    return result || '';
}

export default React.createClass({

    displayName: 'ClusterForm',

    propTypes: {
        data: React.PropTypes.object,
        onChange: React.PropTypes.func,
    },

    getInitialState() {
        return {
            data: this.props.data,
        };
    },

    componentWillReceiveProps(nextProps) {
        const data = nextProps.data,
            oldData = this.props.data;

        if(!deepEquals(data, oldData)) {
            this.setState({data});
        }
    },

    formChange(event) {
        var keyPath = event.target.dataset.key.split('.'),
            currentContainer;
        if (this.props.onChange) {
            const lastKey = keyPath.pop(),
                valueToSave = event.target.value,
                data = this.state.data;

            currentContainer = data;
            while(keyPath.length) {
                currentContainer = currentContainer[keyPath.shift()];
            }

            currentContainer[lastKey] = valueToSave;
            this.setState({data});
            this.props.onChange(data);
        }
    },

    // {
    //     name: 'new cluster',
    //     type: 'trad',
    //     config: {
    //         host: 'localhost',
    //         ssh: {
    //             user: 'Your_Login',
    //         },
    //         parallelEnvironment: '',
    //         numberOfSlots: 1,
    //         jobOutputDir: '/tmp',
    //         paraview: {
    //             installDir: '/opt/paraview',
    //         },
    //     },
    // },

    render() {
        if(!this.state.data) {
            return null;
        }
        return (
            <div>
                <form onSubmit={(e) => {e.preventDefault()} }>
                    { Object.keys(allConfigs).map(key => {
                        const item = allConfigs[key];
                        return (
                            <section className={form.group} key={key}>
                                <label className={form.label} title={item.description}>{item.label}</label>
                                <input className={form.input} type="text" value={getValue(this.state.data, key)}
                                    data-key={key} onChange={this.formChange} required />
                            </section>);
                    })}
                </form>
            </div>);
    },
});
