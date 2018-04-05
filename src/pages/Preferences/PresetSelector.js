import React from 'react';
import PropTypes from 'prop-types';

import editor from 'HPCCloudStyle/ItemEditor.mcss';

export default class PresetSelector extends React.Component {
  constructor(props) {
    super(props);
    this.valueChange = this.valueChange.bind(this);
  }

  valueChange(e) {
    if (this.props.onChange) {
      this.props.onChange(e.target.value);
    }
  }

  render() {
    const optionsMapper = (preset, index) => (
      <option key={`${preset}_${index}`} value={preset}>
        {preset}
      </option>
    );
    return (
      <select
        onChange={this.valueChange}
        className={editor.input}
        value={this.props.value}
      >
        <option value={null}>Presets</option>
        {this.props.contents.map(optionsMapper)}
      </select>
    );
  }
}

PresetSelector.propTypes = {
  contents: PropTypes.array,
  onChange: PropTypes.func,
  value: PropTypes.string,
};

PresetSelector.defaultProps = {
  contents: [],
  onChange: () => {},
  value: '',
};
