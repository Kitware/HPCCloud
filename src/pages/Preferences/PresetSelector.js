import React from 'react';
import editor from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({
  propTypes: {
    contents: React.PropTypes.array,
    onChange: React.PropTypes.func,
    value: React.PropTypes.string,
  },

  valueChange(e) {
    if (this.props.onChange) {
      this.props.onChange(e.target.value);
    }
  },

  render() {
    const optionsMapper = (preset, index) => <option key={`${preset}_${index}`} value={preset}>{ preset }</option>;
    return (
      <select onChange={this.valueChange} className={editor.input} value={this.props.value}>
        <option value={null}>Presets</option>
        { this.props.contents.map(optionsMapper) }
      </select>
    );
  },
});
