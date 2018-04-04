import React from 'react';
import PropTypes from 'prop-types';

export default class FormPanelEnumInput extends React.Component {
  constructor(props) {
    super(props);
    this.editField = this.editField.bind(this);
  }

  editField(event) {
    const value = event.target.value;
    if (this.props.onChange) {
      this.props.onChange(this.props.id, value);
    }
  }

  render() {
    const { style, item, value } = this.props;
    return (
      <section className={style.group}>
        <label className={style.label} title={item.description}>
          {item.label}
        </label>
        <select className={style.input} value={value} onChange={this.editField}>
          {item.values.map((option, index) => (
            <option key={`${option}_${index}`} value={option}>
              {option}
            </option>
          ))}
        </select>
      </section>
    );
  }
}

FormPanelEnumInput.propTypes = {
  id: PropTypes.string,
  item: PropTypes.object,
  value: PropTypes.string,
  style: PropTypes.object,
  onChange: PropTypes.func,
};

FormPanelEnumInput.defaultProps = {
  id: undefined,
  item: undefined,
  value: '',
  style: {},
  onChange: undefined,
};
