import React from 'react';
import PropTypes from 'prop-types';

export default class FormPanelCheckboxInput extends React.Component {
  constructor(props) {
    super(props);
    this.editField = this.editField.bind(this);
  }

  editField(event) {
    if (this.props.onChange) {
      this.props.onChange(this.props.id, !this.props.value);
    }
  }

  render() {
    const { style, item, value } = this.props;
    return (
      <section className={style.group}>
        <label className={style.label} title={item.description}>
          {item.label}
        </label>
        <input
          style={{ position: 'relative', top: '-5px' }}
          type="checkbox"
          checked={value}
          onChange={this.editField}
        />
      </section>
    );
  }
}

FormPanelCheckboxInput.propTypes = {
  id: PropTypes.string,
  item: PropTypes.object,
  value: PropTypes.bool,
  style: PropTypes.object,
  onChange: PropTypes.func,
};

FormPanelCheckboxInput.defaultProps = {
  id: undefined,
  item: undefined,
  value: false,
  style: {},
  onChange: undefined,
};
