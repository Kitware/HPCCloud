import React from 'react';
import deepEquals from 'mout/src/lang/deepEquals';
import CheckboxInput from './CheckboxInput';
import ProfileInput from './ProfileInput';
import EnumInput from './EnumInput';
import TextInput from './TextInput';

const elementMapping = {
  bool: CheckboxInput,
  enum: EnumInput,
  profile: ProfileInput,
  text: TextInput,
};

function getValue(obj, path, type = 'text') {
  var varNames = path.split('.'),
    result = obj;
  while (varNames.length && result) {
    result = result[varNames.shift()];
  }
  if (type === 'text') {
    return result || '';
  }
  if (type === 'bool') {
    return !!result;
  }
  if (type === 'profile') {
    return result || [];
  }
  if (type === 'enum') {
    return result || '';
  }
  console.log('getValue invalid type', type, result);
  return result;
}

export default React.createClass({

  displayName: 'FormPanel',

  propTypes: {
    data: React.PropTypes.object,
    config: React.PropTypes.object,
    onChange: React.PropTypes.func,
    style: React.PropTypes.object,
  },

  getInitialState() {
    return {
      data: this.props.data || {},
    };
  },

  componentWillReceiveProps(nextProps) {
    const data = nextProps.data,
      oldData = this.props.data;

    if (!deepEquals(data, oldData)) {
      this.setState({ data });
    }
  },

  onChange(id, value) {
    const keyPath = id.split('.');
    let currentContainer = null;

    const lastKey = keyPath.pop(),
      data = this.state.data;

    currentContainer = data;
    while (keyPath.length) {
      const nextKey = keyPath.shift();
      if (!currentContainer[nextKey]) {
        currentContainer[nextKey] = {};
      }
      currentContainer = currentContainer[nextKey];
    }

    currentContainer[lastKey] = value;
    this.setState({ data });

    if (this.props.onChange) {
      this.props.onChange(data);
    }
  },

  render() {
    const onChange = this.onChange;
    const data = this.state.data;
    const { config, style } = this.props;
    return (
      <div>
        { Object.keys(config).map(key => {
          const item = config[key];
          const id = key;
          const value = getValue(data, id, item.type);

          return React.createElement(elementMapping[item.type], { style, item, id, key, value, onChange });
        })}
      </div>);
  },
});
